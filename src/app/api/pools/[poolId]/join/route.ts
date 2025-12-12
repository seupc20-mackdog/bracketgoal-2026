import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { toE164BR } from "@/lib/invites";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

type PoolInviteSummary = {
  id: string;
  name: string;
  tournament_id: string | null;
  max_participants: number;
  status: string;
  access_type: "private" | "public" | null;
  num_matches: number | null;
  organizers: { display_name: string | null }[] | null;
};

function missingSupabase() {
  return NextResponse.json(
    {
      error:
        "Supabase não configurado no servidor. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    },
    { status: 500 }
  );
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { poolId: string } }
) {
  if (!supabase) return missingSupabase();

  const poolId = params.poolId;
  if (!poolId) return badRequest("poolId não informado.");

  const { data: pool, error: poolError } = await supabase
    .from("pools")
    .select(
      `
      id,
      name,
      tournament_id,
      max_participants,
      status,
      access_type,
      num_matches,
      organizers ( display_name )
    `
    )
    .eq("id", poolId)
    .single();

  if (poolError || !pool) {
    return NextResponse.json({ error: "Bolão não encontrado." }, { status: 404 });
  }

  const { count: participantsCount, error: countError } = await supabase
    .from("pool_entries")
    .select("id", { count: "exact", head: true })
    .eq("pool_id", poolId);

  if (countError) {
    return NextResponse.json(
      { error: "Não foi possível contar os participantes." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    pool: pool as PoolInviteSummary,
    participantsCount: participantsCount ?? 0,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { poolId: string } }
) {
  if (!supabase) return missingSupabase();

  const poolId = params.poolId;
  if (!poolId) return badRequest("poolId não informado.");

  const body = await req.json().catch(() => null);
  const rawName = (body?.displayName ?? "") as string;
  const rawWhatsapp = (body?.whatsapp ?? "") as string;
  const userId =
    typeof body?.userId === "string" && body.userId.trim().length > 0
      ? body.userId.trim()
      : null;

  const displayName = rawName.trim();
  const whatsapp = rawWhatsapp.trim();
  const whatsappNormalized = toE164BR(whatsapp);

  if (!displayName || displayName.length < 2) {
    return badRequest("Informe um nome para entrar no bolão.");
  }

  const { data: pool, error: poolError } = await supabase
    .from("pools")
    .select("id, max_participants, status")
    .eq("id", poolId)
    .single();

  if (poolError || !pool) {
    return NextResponse.json({ error: "Bolão não encontrado." }, { status: 404 });
  }

  if (pool.status !== "active") {
    return badRequest(
      "Este bolão ainda não está ativo. Confirme o pagamento e a ativação antes de convidar."
    );
  }

  const { count: participantsCount, error: countError } = await supabase
    .from("pool_entries")
    .select("id", { count: "exact", head: true })
    .eq("pool_id", poolId);

  if (countError) {
    return NextResponse.json(
      { error: "Não foi possível validar a capacidade do bolão." },
      { status: 500 }
    );
  }

  if ((participantsCount ?? 0) >= (pool.max_participants ?? 0)) {
    return badRequest("Limite máximo de participantes atingido.");
  }

  if (userId) {
    const { data: existingByUser, error: existingUserError } = await supabase
      .from("pool_entries")
      .select("id, display_name, status")
      .eq("pool_id", poolId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingUserError) {
      return NextResponse.json(
        { error: "Erro ao verificar inscrições existentes." },
        { status: 500 }
      );
    }

    if (existingByUser) {
      return NextResponse.json(
        {
          alreadyJoined: true,
          entry: existingByUser,
          message: "Você já está inscrito neste bolão.",
        },
        { status: 200 }
      );
    }
  }

  const { data: existingByName, error: existingNameError } = await supabase
    .from("pool_entries")
    .select("id, display_name, status")
    .eq("pool_id", poolId)
    .ilike("display_name", displayName)
    .maybeSingle();

  if (existingNameError) {
    return NextResponse.json(
      { error: "Erro ao verificar nomes já registrados." },
      { status: 500 }
    );
  }

  if (existingByName) {
    return NextResponse.json(
      {
        error:
          "Já existe um participante com esse nome. Use um apelido ou acrescente um sobrenome.",
      },
      { status: 409 }
    );
  }

  if (whatsappNormalized) {
    const { data: existingByPhone, error: existingPhoneError } = await supabase
      .from("pool_entries")
      .select("id, status, display_name, user_id")
      .eq("pool_id", poolId)
      .eq("whatsapp", whatsappNormalized)
      .maybeSingle();

    if (existingPhoneError) {
      return NextResponse.json(
        { error: "Erro ao verificar WhatsApp já registrado." },
        { status: 500 }
      );
    }

    if (existingByPhone) {
      if (existingByPhone.status === "invited") {
        const { error: updateInvitedError } = await supabase
          .from("pool_entries")
          .update({
            status: "active",
            display_name: displayName.slice(0, 80),
            user_id: userId ?? existingByPhone.user_id,
            whatsapp: whatsappNormalized,
          })
          .eq("id", existingByPhone.id);

        if (updateInvitedError) {
          return NextResponse.json(
            {
              error:
                "Convite existente encontrado, mas falhou ao confirmar sua entrada.",
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            alreadyJoined: true,
            message: "Convite confirmado! Você já estava pré-convidado.",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Este WhatsApp já está registrado neste bolão. Use outro número ou fale com o organizador.",
        },
        { status: 409 }
      );
    }
  }

  const { data: newEntry, error: insertError } = await supabase
    .from("pool_entries")
    .insert({
      pool_id: poolId,
      user_id: userId,
      display_name: displayName.slice(0, 80),
      whatsapp: whatsappNormalized ? whatsappNormalized.slice(0, 40) : null,
      status: "active",
      score: 0,
    })
    .select("id, display_name, whatsapp, status, score, created_at")
    .single();

  if (insertError || !newEntry) {
    return NextResponse.json(
      {
        error:
          "Não foi possível registrar sua participação. Tente novamente ou fale com o organizador.",
        details: insertError?.message ?? insertError,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      entry: newEntry,
      participantsCount: (participantsCount ?? 0) + 1,
    },
    { status: 201 }
  );
}
