// src/app/api/mercadopago/confirm/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const mpAccessToken =
  process.env.MERCADO_PAGO_ACCESS_TOKEN ?? process.env.MERCADOPAGO_ACCESS_TOKEN;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

type ConfirmPayload = {
  poolId?: string;
  paymentId?: string; // internal payment id (UUID da tabela payments)
  mpPaymentId?: string; // opcional: id do pagamento MP
  status?: string; // opcional: status retornado pelo redirect
};

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, details: details ?? null },
    { status }
  );
}

async function resolveInternalPaymentId(params: URLSearchParams, body?: ConfirmPayload) {
  // Prioridade: paymentId (internal)
  const paymentId =
    body?.paymentId ??
    params.get("paymentId") ??
    params.get("payment_id") ??
    params.get("external_reference") ??
    undefined;

  if (paymentId) return { internalPaymentId: paymentId, mpPaymentId: undefined };

  // Fallback: tentar descobrir via mpPaymentId (consulta no MP e pega external_reference)
  const mpPaymentId =
    body?.mpPaymentId ?? params.get("mpPaymentId") ?? params.get("mp_payment_id") ?? undefined;

  if (!mpPaymentId) return { internalPaymentId: undefined, mpPaymentId: undefined };

  if (!mpAccessToken) {
    return { internalPaymentId: undefined, mpPaymentId };
  }

  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${mpAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!mpRes.ok) {
    const errText = await mpRes.text().catch(() => "");
    throw new Error(`Falha ao consultar pagamento no Mercado Pago: ${mpRes.status} ${errText}`);
  }

  const mpJson = (await mpRes.json()) as { external_reference?: string };
  const externalRef = mpJson?.external_reference;

  return { internalPaymentId: externalRef, mpPaymentId };
}

async function confirmPaymentAndActivatePool(input: {
  poolId?: string;
  internalPaymentId?: string;
  mpPaymentId?: string;
  status?: string;
}) {
  if (!supabase) {
    return jsonError("Supabase não configurado no servidor.", 500);
  }

  const { poolId, internalPaymentId, mpPaymentId } = input;

  if (!internalPaymentId) {
    return jsonError(
      "paymentId não informado. Envie ?paymentId=... (external_reference) ou mpPaymentId para resolver.",
      400
    );
  }

  // 1) Buscar pagamento interno
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("id, pool_id, entry_id, status, psp_reference")
    .eq("id", internalPaymentId)
    .single();

  if (payErr || !payment) {
    return jsonError("Pagamento interno não encontrado.", 404, payErr?.message ?? payErr);
  }

  // 2) Garantir que é pagamento do SERVIÇO (entry_id deve ser null)
  if (payment.entry_id !== null) {
    return jsonError(
      "Este endpoint confirma pagamento do serviço do bolão (entry_id deve ser null).",
      400
    );
  }

  // Se poolId veio no link, validar consistência (opcional)
  if (poolId && payment.pool_id && poolId !== payment.pool_id) {
    return jsonError("poolId não confere com o pagamento informado.", 400);
  }

  const finalPoolId: string = payment.pool_id;

  // 3) Atualizar payment para approved (idempotente)
  // Também tentamos salvar a referência do PSP (mpPaymentId) se existir e não houver psp_reference
  const nextPaymentUpdate: Record<string, any> = {
    status: "approved",
  };
  if (mpPaymentId && !payment.psp_reference) {
    nextPaymentUpdate.psp_reference = String(mpPaymentId);
  }

  if (payment.status !== "approved" || nextPaymentUpdate.psp_reference) {
    const { error: updPayErr } = await supabase
      .from("payments")
      .update(nextPaymentUpdate)
      .eq("id", payment.id);

    if (updPayErr) {
      return jsonError("Falha ao atualizar status do pagamento.", 500, updPayErr.message);
    }
  }

  // 4) Ativar o bolão (idempotente)
  const { data: pool, error: poolErr } = await supabase
    .from("pools")
    .select("id, status")
    .eq("id", finalPoolId)
    .single();

  if (poolErr || !pool) {
    return jsonError("Bolão não encontrado para este pagamento.", 404, poolErr?.message ?? poolErr);
  }

  if (pool.status !== "active") {
    const { error: updPoolErr } = await supabase
      .from("pools")
      .update({ status: "active" })
      .eq("id", finalPoolId);

    if (updPoolErr) {
      return jsonError("Falha ao ativar bolão após pagamento.", 500, updPoolErr.message);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      poolId: finalPoolId,
      paymentId: payment.id,
    },
    { status: 200 }
  );
}

// GET: útil quando você redireciona de uma página (success) e quer confirmar via fetch simples.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    const poolId = params.get("poolId") ?? params.get("pool_id") ?? undefined;
    const status = params.get("status") ?? undefined;

    const { internalPaymentId, mpPaymentId } = await resolveInternalPaymentId(params);

    return await confirmPaymentAndActivatePool({
      poolId,
      internalPaymentId,
      mpPaymentId,
      status,
    });
  } catch (err: any) {
    return jsonError("Erro interno ao confirmar pagamento.", 500, err?.message ?? String(err));
  }
}

// POST: útil se sua página /success enviar JSON.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    const body = (await req.json().catch(() => ({}))) as ConfirmPayload;

    const poolId =
      body.poolId ?? params.get("poolId") ?? params.get("pool_id") ?? undefined;

    const status = body.status ?? params.get("status") ?? undefined;

    const { internalPaymentId, mpPaymentId } = await resolveInternalPaymentId(params, body);

    return await confirmPaymentAndActivatePool({
      poolId,
      internalPaymentId,
      mpPaymentId,
      status,
    });
  } catch (err: any) {
    return jsonError("Erro interno ao confirmar pagamento.", 500, err?.message ?? String(err));
  }
}
