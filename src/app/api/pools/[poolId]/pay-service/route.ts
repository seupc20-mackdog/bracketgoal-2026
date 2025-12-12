import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
        {
          error:
            "Supabase não configurado no servidor. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
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

    // 2) Criar registro de pagamento já marcado como pago (modo simulado)
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        pool_id: pool.id,
        entry_id: null, // pagamento do SERVIÇO, não de participante
        amount,
        currency,
        method: "mercado_pago_simulado",
        status: "approved",
        psp_reference: "simulado",
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

    // 3) Ativar imediatamente o bolão
    const { error: poolUpdateError } = await supabase
      .from("pools")
      .update({
        status: "active",
        starts_at: new Date().toISOString(),
      })
      .eq("id", pool.id);

    if (poolUpdateError) {
      console.error("[pay-service] Erro ao ativar bolão:", poolUpdateError);
      return NextResponse.json(
        {
          error:
            "Pagamento simulado registrado, mas falhou ao ativar o bolão. Verifique no painel.",
          details: poolUpdateError?.message ?? poolUpdateError,
        },
        { status: 500 }
      );
    }

    // 4) Retornar próximo passo (pular checkout externo)
    return NextResponse.json(
      {
        paymentId: payment.id as string,
        status: "approved_simulated",
        nextUrl: `${appUrl}/pools/${pool.id}/invites`,
        message:
          "Checkout Mercado Pago desativado temporariamente. Bolão marcado como pago e ativado.",
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
