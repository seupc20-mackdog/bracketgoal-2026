import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export async function GET(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase não configurado." },
        { status: 500 }
      );
    }

    if (!mpAccessToken) {
      return NextResponse.json(
        { success: false, error: "MERCADOPAGO_ACCESS_TOKEN não configurado." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const mpPaymentId =
      searchParams.get("payment_id") ?? searchParams.get("paymentId");
    const externalRefParam = searchParams.get("external_reference");
    const poolIdParam = searchParams.get("poolId");

    if (!mpPaymentId) {
      return NextResponse.json(
        { success: false, error: "payment_id não informado." },
        { status: 400 }
      );
    }

    // 1) Buscar detalhes do pagamento no Mercado Pago
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${mpPaymentId}`,
      {
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
        },
      }
    );

    if (!mpResponse.ok) {
      const txt = await mpResponse.text();
      console.error("Erro ao consultar pagamento no Mercado Pago:", txt);
      return NextResponse.json(
        {
          success: false,
          error: "Não foi possível consultar o pagamento no Mercado Pago.",
          details: txt,
        },
        { status: 500 }
      );
    }

    const mpJson: any = await mpResponse.json();

    const mpStatus = mpJson.status;
    const externalReference: string | undefined = mpJson.external_reference;

    if (mpStatus !== "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Pagamento não está aprovado.",
          status: mpStatus,
        },
        { status: 400 }
      );
    }

    const internalPaymentId =
      externalRefParam || (externalReference ? String(externalReference) : null);

    if (!internalPaymentId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível identificar o pagamento interno (external_reference ausente).",
        },
        { status: 400 }
      );
    }

    // 2) Buscar pagamento interno
    const { data: internalPayment, error: internalPaymentError } =
      await supabase
        .from("payments")
        .select("id, pool_id, status")
        .eq("id", internalPaymentId)
        .single();

    if (internalPaymentError || !internalPayment) {
      console.error(
        "Pagamento interno não encontrado:",
        internalPaymentError ?? internalPayment
      );
      return NextResponse.json(
        {
          success: false,
          error: "Pagamento interno não encontrado.",
        },
        { status: 404 }
      );
    }

    // 3) Atualizar pagamento para 'paid' se ainda não estiver
    if (internalPayment.status !== "paid") {
      const { error: updatePayError } = await supabase
        .from("payments")
        .update({
          status: "paid",
          psp_reference: String(mpJson.id),
        })
        .eq("id", internalPayment.id);

      if (updatePayError) {
        console.error(
          "Erro ao atualizar pagamento interno para 'paid':",
          updatePayError
        );
        return NextResponse.json(
          {
            success: false,
            error: "Pagamento aprovado, mas falhou ao atualizar registro interno.",
          },
          { status: 500 }
        );
      }
    }

    const poolId = poolIdParam || internalPayment.pool_id;

    if (!poolId) {
      // Sem poolId não conseguimos ativar bolão, mas o pagamento está ok
      return NextResponse.json(
        {
          success: true,
          warning:
            "Pagamento confirmado, mas não foi possível identificar o bolão para ativar.",
        },
        { status: 200 }
      );
    }

    // 4) Ativar o bolão (status = 'active')
    const { error: updatePoolError } = await supabase
      .from("pools")
      .update({
        status: "active",
        starts_at: new Date().toISOString(),
      })
      .eq("id", poolId);

    if (updatePoolError) {
      console.error("Erro ao ativar bolão após pagamento:", updatePoolError);
      return NextResponse.json(
        {
          success: false,
          error:
            "Pagamento confirmado, mas não foi possível ativar o bolão. Verifique no painel.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Erro inesperado em /api/mercadopago/confirm:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao confirmar pagamento.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
