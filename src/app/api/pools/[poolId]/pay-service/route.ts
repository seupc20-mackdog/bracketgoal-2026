import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export async function POST(
  _req: NextRequest,
  context: { params: { poolId: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase não configurado no servidor." },
        { status: 500 }
      );
    }

    if (!mpToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
      return NextResponse.json(
        {
          error:
            "MERCADO_PAGO_ACCESS_TOKEN não configurado no servidor.",
        },
        { status: 500 }
      );
    }

    const poolId = context.params?.poolId;
    if (!poolId) {
      return NextResponse.json(
        { error: "poolId não informado na URL." },
        { status: 400 }
      );
    }

    // 1) Buscar dados do bolão no banco (precisamos do valor e nome)
    const { data: pool, error: poolError } = await supabase
      .from("pools")
      .select(
        `
        id,
        name,
        total_price,
        currency,
        organizers (
          display_name
        )
      `
      )
      .eq("id", poolId)
      .single();

    if (poolError || !pool) {
      console.error(
        "Erro ao carregar pool para pagamento:",
        poolError
      );
      return NextResponse.json(
        {
          error:
            "Não foi possível carregar os dados do bolão para pagamento.",
          details: poolError?.message ?? poolError,
        },
        { status: 500 }
      );
    }

    const amount: number = pool.total_price ?? 0;
    const currency: string = pool.currency ?? "BRL";

    if (amount <= 0) {
      return NextResponse.json(
        {
          error:
            "Valor do serviço do bolão é inválido ou zero. Verifique a coluna total_price da tabela pools.",
        },
        { status: 400 }
      );
    }

    // 2) Montar o body da preferência do Mercado Pago
    const preferenceBody = {
      items: [
        {
          title: `Serviço BracketGoal – Bolão "${pool.name}"`,
          quantity: 1,
          currency_id: currency,
          unit_price: amount,
        },
      ],
      back_urls: {
        success: `${appUrl}/payments/mercadopago/success?poolId=${poolId}&status=success`,
        failure: `${appUrl}/payments/mercadopago/success?poolId=${poolId}&status=failure`,
        pending: `${appUrl}/payments/mercadopago/success?poolId=${poolId}&status=pending`,
      },
      auto_return: "approved" as const,
      metadata: {
        poolId,
        organizerName: pool.organizers?.display_name ?? null,
      },
    };

    // 3) Chamar a API de Preferências do Mercado Pago
    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpToken}`,
        },
        body: JSON.stringify(preferenceBody),
      }
    );

    const mpJson = await mpResponse.json().catch(() => null);

    if (!mpResponse.ok) {
      console.error(
        "Erro ao criar preferência no Mercado Pago:",
        mpResponse.status,
        mpJson
      );
      return NextResponse.json(
        {
          error:
            "Falha ao criar preferência de pagamento no Mercado Pago.",
          status: mpResponse.status,
          details: mpJson ?? null,
        },
        { status: 500 }
      );
    }

    // 4) Retornar a URL de redirecionamento para o front
    return NextResponse.json(
      {
        id: mpJson.id,
        initPoint: mpJson.init_point,
        sandboxInitPoint: mpJson.sandbox_init_point,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "Erro inesperado em /api/pools/[poolId]/pay-service:",
      err
    );
    return NextResponse.json(
      {
        error:
          "Erro inesperado ao iniciar o pagamento do serviço.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
