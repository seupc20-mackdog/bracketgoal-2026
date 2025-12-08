import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Supabase somente no servidor com service role
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export async function POST(
  req: Request,
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
      return NextResponse.json(
        { error: "MERCADO_PAGO_ACCESS_TOKEN não configurado." },
        { status: 500 }
      );
    }

    const { poolId } = context.params;

    if (!poolId) {
      return NextResponse.json(
        { error: "PoolId não informado." },
        { status: 400 }
      );
    }

    // 1) Buscar o bolão para saber valor e descrição
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
      console.error("Erro ao buscar pool para pagamento:", poolError);
      return NextResponse.json(
        { error: "Não foi possível localizar o bolão para pagamento." },
        { status: 404 }
      );
    }

    const totalPrice = Number(pool.total_price ?? 0);

    if (!totalPrice || totalPrice <= 0) {
      return NextResponse.json(
        {
          error:
            "Valor do serviço (total_price) inválido ou zero. Ajuste a lógica de preço antes de cobrar.",
        },
        { status: 400 }
      );
    }

    const title = `Serviço BracketGoal – ${pool.name}`;
    const organizerName = pool.organizers?.display_name || "Organizador";

    // 2) Criar preferência no Mercado Pago
    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpToken}`,
        },
        body: JSON.stringify({
          items: [
            {
              title,
              description: `Serviço de bolão entre amigos – Organizador: ${organizerName}`,
              quantity: 1,
              currency_id: pool.currency || "BRL",
              unit_price: totalPrice,
            },
          ],
          external_reference: pool.id,
          metadata: {
            poolId: pool.id,
            environment: process.env.NODE_ENV,
          },
          back_urls: {
            success: `${appBaseUrl}/pools/${poolId}/invites?payment=success`,
            failure: `${appBaseUrl}/pools/${poolId}/checkout?payment=failure`,
            pending: `${appBaseUrl}/pools/${poolId}/checkout?payment=pending`,
          },
          auto_return: "approved",
          // coloque depois seu webhook real aqui, quando tiver
          // notification_url: `${appBaseUrl}/api/mercadopago/webhook`,
        }),
      }
    );

    if (!mpResponse.ok) {
      const errBody = await mpResponse.json().catch(() => null);
      console.error("Erro da API Mercado Pago:", errBody);
      return NextResponse.json(
        {
          error: "Falha ao criar preferência de pagamento no Mercado Pago.",
          details: errBody,
        },
        { status: 500 }
      );
    }

    const pref = (await mpResponse.json()) as {
      id?: string;
      init_point?: string;
      sandbox_init_point?: string;
    };

    return NextResponse.json(
      {
        preferenceId: pref.id,
        initPoint: pref.init_point,
        sandboxInitPoint: pref.sandbox_init_point,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Erro inesperado em /api/pools/[poolId]/pay-service:", err);
    return NextResponse.json(
      {
        error: "Erro interno ao iniciar pagamento do serviço.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
