import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase apenas no servidor com service role (NUNCA no client)
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

type Mode = "friends" | "company" | "creator";

interface FriendConfigPayload {
  tournamentType:
    | "worldcup_2026"
    | "brasileirao_2026"
    | "champions_league"
    | "custom";
  poolName: string;
  numMatches: number;
  filterHours: number;
  maxPlayers: number;
  accessType: "private" | "public";
}

interface CreatePoolBody {
  mode: Mode;
  ownerUserId: string | null;
  ownerEmail: string | null;
  config: FriendConfigPayload;
}

// regra simples para definir tipo de organizador
function mapModeToOrganizerType(
  mode: Mode
): "amigos" | "empresa" | "influencer" {
  if (mode === "company") return "empresa";
  if (mode === "creator") return "influencer";
  return "amigos";
}

// converte wizard -> id da tabela tournaments
function mapTournamentId(
  tournamentType: FriendConfigPayload["tournamentType"]
): string | null {
  switch (tournamentType) {
    case "worldcup_2026":
      return "world-cup-2026";
    case "brasileirao_2026":
      return "brasileirao-serie-a-2026";
    case "champions_league":
      return "champions-league-2025-2026";
    default:
      return null; // custom
  }
}

// calcula preço do serviço (pode ajustar sua lógica aqui)
function calcServicePrice(numMatches: number, maxPlayers: number): number {
  const base = 9.9;
  const perMatch = 1.2;
  const factorPlayers = Math.max(1, Math.ceil(maxPlayers / 20));
  const price = base + numMatches * perMatch * factorPlayers;
  return Number(price.toFixed(2));
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase não configurado no servidor." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as CreatePoolBody;

    const { mode, ownerUserId, ownerEmail, config } = body;

    if (!ownerUserId) {
      return NextResponse.json(
        { error: "Usuário não autenticado para criar bolão." },
        { status: 401 }
      );
    }

    if (!config?.poolName || !config?.tournamentType) {
      return NextResponse.json(
        { error: "Configuração de bolão incompleta." },
        { status: 400 }
      );
    }

    if (!config.maxPlayers || config.maxPlayers <= 0) {
      return NextResponse.json(
        { error: "Número de participantes inválido." },
        { status: 400 }
      );
    }

    if (!config.numMatches || config.numMatches <= 0) {
      return NextResponse.json(
        { error: "Número de jogos do bolão inválido." },
        { status: 400 }
      );
    }

    const organizerType = mapModeToOrganizerType(mode);
    const mappedTournamentId = mapTournamentId(config.tournamentType);
    const totalPrice = calcServicePrice(config.numMatches, config.maxPlayers);

    // ===== 1) Verifica / cria organizer =====
    const { data: existingOrganizers, error: orgSelectError } = await supabase
      .from("organizers")
      .select("id")
      .eq("owner_user_id", ownerUserId)
      .eq("type", organizerType)
      .limit(1);

    if (orgSelectError) {
      console.error("Erro ao buscar organizer:", orgSelectError);
      return NextResponse.json(
        {
          error: "Erro ao buscar organizador no banco de dados.",
          details: orgSelectError.message,
        },
        { status: 500 }
      );
    }

    let organizerId: string;

    const organizerRow = (existingOrganizers?.[0] ??
      null) as { id?: string } | null;

    if (organizerRow?.id) {
      organizerId = organizerRow.id;
    } else {
      // 2) Cria organizer "amigos"/"empresa"/"influencer" para o usuário
      const baseName =
        organizerType === "amigos"
          ? ownerEmail
            ? `Amigos de ${ownerEmail}`
            : config.poolName
          : config.poolName;

      const organizerSlug =
        organizerType +
        "-" +
        slugify(baseName || "organizer") +
        "-" +
        Date.now().toString(36).slice(-4);

      const { data: newOrganizer, error: orgInsertError } = await supabase
        .from("organizers")
        .insert({
          owner_user_id: ownerUserId,
          type: organizerType,
          display_name: baseName?.slice(0, 80) ?? "Organizador",
          slug: organizerSlug,
          logo_url: null,
        })
        .select("id")
        .single();

      if (orgInsertError || !newOrganizer || !newOrganizer.id) {
        console.error("Erro ao criar organizer:", orgInsertError);
        return NextResponse.json(
          {
            error: "Erro ao criar organizador no banco de dados.",
            details: orgInsertError?.message ?? orgInsertError,
          },
          { status: 500 }
        );
      }

      organizerId = newOrganizer.id as string;
    }

    // ===== 2) Confirmar se o torneio existe (evitar FK 23503) =====
    let tournamentIdToUse: string | null = null;

    if (mappedTournamentId) {
      const { data: tournamentRow, error: tErr } = await supabase
        .from("tournaments")
        .select("id")
        .eq("id", mappedTournamentId)
        .maybeSingle();

      if (tErr) {
        console.warn("Aviso: erro ao verificar torneio:", tErr);
        // Se der erro aqui, vamos seguir com tournament_id = null
        tournamentIdToUse = null;
      } else if (tournamentRow?.id) {
        tournamentIdToUse = tournamentRow.id as string;
      } else {
        // Não encontrou torneio com esse ID → segue como custom (null)
        tournamentIdToUse = null;
      }
    }

    // ===== 3) Cria pool (bolão) ligada ao organizer =====
    const poolSlug =
      slugify(config.poolName) + "-" + Date.now().toString(36).slice(-4);

    const { data: newPool, error: poolInsertError } = await supabase
      .from("pools")
      .insert({
        organizer_id: organizerId,
        tournament_id: tournamentIdToUse, // pode ser null se não achar
        name: config.poolName,
        slug: poolSlug,
        description: null,

        max_participants: config.maxPlayers,
        payment_mode: "organizer_pays",
        price_per_entry: null,
        total_price: totalPrice,
        currency: "BRL",

        status: "draft",

        starts_at: null,
        ends_at: null,

        // campos extras
        num_matches: config.numMatches,
        filter_hours: config.filterHours,
        access_type: config.accessType,
      })
      .select("id")
      .single();

    if (poolInsertError || !newPool || !newPool.id) {
      console.error("Erro ao criar pool:", poolInsertError);
      return NextResponse.json(
        {
          error: "Erro ao criar bolão no banco de dados.",
          details: poolInsertError?.message ?? poolInsertError,
          code: (poolInsertError as any)?.code ?? null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ poolId: newPool.id }, { status: 201 });
  } catch (err: any) {
    console.error("Erro inesperado em /api/pools:", err);
    return NextResponse.json(
      {
        error: "Erro interno ao criar bolão.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
