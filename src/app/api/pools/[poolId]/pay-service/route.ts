import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const mpAccessToken =
  process.env.MERCADO_PAGO_ACCESS_TOKEN ??
  process.env.MERCADOPAGO_ACCESS_TOKEN;

// Normaliza a URL base do app (tira barra final e garante http/https)
const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const appUrl =
  rawAppUrl && rawAppUrl.startsWith("http")
    ? rawAppUrl.replace(/\/+$/, "")
    : "http://localhost:3000";

// Logs de diagnóstico básicos
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("[pay-service] Variáveis do Supabase ausentes:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceRoleKey,
  });
}

if (!mpAccessToken) {
  console.error(
    "[pay-service] MERCADO_PAGO_ACCESS_TOKEN / MERCADOPAGO_ACCESS_TOKEN ausente nas env vars"
  );
}

// Supabase apenas no servidor com service role
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export async function POST(
  _req: Request,
  { params }: { params: { poolId: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase não configurado no servidor." },
        { status: 500 }
      );
    }

    if (!mpAccessToken) {
      return NextResponse.json(
        {
          error:
            "MERCADO_PAGO_ACCESS_TOKEN (ou MERCADOPAGO_ACCESS_TOKEN) não configurado.",
        },
        { status: 500 }
      );
    }

    const poolId = params?.poolId;
    if (!poolId) {
      return NextResponse.json(
        { error: "ID do bolão não informado." },
        { status: 400 }
      );
    }

    // 1) Buscar o bolão para saber valor e nome
    const { data: pool, error: poolError } = await supabase
      .from("pools")
      .select("id, name, total_price, currency, status")
      .eq("id", poolId)
      .single();

    if (poolError || !pool) {
      console.error("[pay-service] Erro ao buscar pool:", poolError);
      return NextResponse.json(
        { error: "Não foi possível localizar este bolão." },
        { status: 404 }
      );
    }

    const amount = Number(pool.total_price ?? 0);
    const currency = pool.currency || "BRL";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error:
            "Valor do serviço inválido. Verifique a coluna total_price na tabela pools.",
        },
        { status: 400 }
      );
    }

    // 2) Criar registro de pagamento PENDENTE (serviço do bolão)
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        pool_id: pool.id,
        entry_id: null, // pagamento do SERVIÇO, não de participante
        amount,
        currency,
        method: "mercado_pago",
        status: "pending",
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      console.error("[pay-service] Erro ao criar registro de pagamento:", paymentError);
      return NextResponse.json(
        {
          error: "Não foi possível registrar o pagamento do serviço.",
          details: paymentError?.message ?? paymentError,
        },
        { status: 500 }
      );
    }

    const internalPaymentId = payment.id as string;

    // 3) Montar corpo da preferência do Mercado Pago
    const preferenceBody = {
      items: [
        {
          title: `Serviço BracketGoal - ${pool.name}`,
          quantity: 1,
          currency_id: currency,
          unit_price: amount,
        },
      ],
      back_urls: {
        success: `${appUrl}/payments/mercadopago/success?poolId=${pool.id}&paymentId=${internalPaymentId}`,
        failure: `${appUrl}/payments/mercadopago/failure?poolId=${pool.id}&paymentId=${internalPaymentId}`,
        pending: `${appUrl}/payments/mercadopago/pending?poolId=${pool.id}&paymentId=${internalPaymentId}`,
      },
      // Removido auto_return por enquanto para evitar erro de validação:
      // auto_return: "approved",
      external_reference: internalPaymentId,
    };

    console.log("[pay-service] Criando preferência no Mercado Pago:", {
      appUrl,
      preferenceBody,
    });

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpAccessToken}`,
        },
        body: JSON.stringify(preferenceBody),
      }
    );

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error(
        "[pay-service] Erro ao criar preferência no Mercado Pago:",
        mpResponse.status,
        errText
      );

      return NextResponse.json(
        {
          error:
            "Erro ao criar preferência de pagamento no Mercado Pago (serviço).",
          details: errText,
        },
        { status: 500 }
      );
    }

    const prefJson = await mpResponse.json();

    // 4) Atualizar registro de pagamento com referência do PSP (id da preferência)
    await supabase
      .from("payments")
      .update({ psp_reference: String(prefJson.id) })
      .eq("id", internalPaymentId);

    // 5) Retornar URL de checkout do Mercado Pago
    return NextResponse.json(
      {
        paymentId: internalPaymentId,
        initPoint: prefJson.init_point ?? prefJson.sandbox_init_point ?? null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "Erro inesperado em /api/pools/[poolId]/pay-service:",
      err?.message ?? err
    );
    return NextResponse.json(
      {
        error: "Erro interno ao iniciar pagamento do serviço.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
