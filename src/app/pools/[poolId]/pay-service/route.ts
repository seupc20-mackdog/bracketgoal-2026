import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// === Supabase ===
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Aceita MERCADO_PAGO_ACCESS_TOKEN ou MERCADOPAGO_ACCESS_TOKEN
const mpAccessToken =
  process.env.MERCADO_PAGO_ACCESS_TOKEN ??
  process.env.MERCADOPAGO_ACCESS_TOKEN;

// URL base da aplicação (produção ou local)
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Supabase apenas no servidor com service role
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export async function POST(
  req: Request,
  { params }: { params: { poolId: string } }
) {
  try {
    if (!supabase) {
      console.error(
        "[pay-service] Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
      );
      return NextResponse.json(
        { error: "Supabase não configurado no servidor." },
        { status: 500 }
      );
    }

    if (!mpAccessToken) {
      console.error(
        "[pay-service] MERCADO_PAGO_ACCESS_TOKEN / MERCADOPAGO_ACCESS_TOKEN não configurado."
      );
      return NextResponse.json(
        {
          error:
            "MERCADO_PAGO_ACCESS_TOKEN (ou MERCADOPAGO_ACCESS_TOKEN) não configurado.",
        },
        { status: 500 }
      );
    }

    const poolId = params.poolId;
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

    // Garantir número real para o Mercado Pago
    const rawAmount = pool.total_price;
    const amount =
      typeof rawAmount === "string"
        ? parseFloat(rawAmount)
        : Number(rawAmount ?? 0);

    const currency = (pool.currency || "BRL").toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      console.error(
        "[pay-service] Valor inválido de total_price:",
        rawAmount,
        "->",
        amount
      );
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
      console.error(
        "[pay-service] Erro ao criar registro de pagamento:",
        paymentError
      );
      return NextResponse.json(
        {
          error: "Não foi possível registrar o pagamento do serviço.",
          details: paymentError?.message ?? paymentError,
        },
        { status: 500 }
      );
    }

    const internalPaymentId = payment.id as string;

    // 3) Criar preferência no Mercado Pago
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
      auto_return: "approved",
      external_reference: internalPaymentId,
    };

    console.log("[pay-service] Enviando preferência ao Mercado Pago:", {
      items: preferenceBody.items,
      back_urls: preferenceBody.back_urls,
      amount,
      currency,
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

    const rawText = await mpResponse.text();
    let prefJson: any = null;
    try {
      prefJson = rawText ? JSON.parse(rawText) : null;
    } catch {
      prefJson = null;
    }

    if (!mpResponse.ok) {
      console.error("[pay-service] Erro ao criar preferência no Mercado Pago:", {
        status: mpResponse.status,
        body: rawText,
      });

      return NextResponse.json(
        {
          error:
            "Erro ao criar preferência de pagamento no Mercado Pago (serviço).",
          mpStatus: mpResponse.status,
          mpBody: prefJson ?? rawText,
        },
        { status: 500 }
      );
    }

    console.log("[pay-service] Preferência criada com sucesso:", prefJson?.id);

    // 4) Atualizar registro de pagamento com referência do PSP (preferência)
    try {
      await supabase
        .from("payments")
        .update({ psp_reference: String(prefJson?.id ?? "") })
        .eq("id", internalPaymentId);
    } catch (updateErr) {
      console.error(
        "[pay-service] Falha ao atualizar psp_reference em payments:",
        updateErr
      );
      // Não bloqueia o fluxo de redirecionamento
    }

    const initPoint: string | null = prefJson?.init_point ?? null;
    const sandboxInitPoint: string | null = prefJson?.sandbox_init_point ?? null;

    return NextResponse.json(
      {
        paymentId: internalPaymentId,
        initPoint,
        sandboxInitPoint,
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
