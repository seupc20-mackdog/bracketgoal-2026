import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase com Service Role — apenas no servidor
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

    const poolId = params.poolId;
    if (!poolId) {
      return NextResponse.json(
        { error: "ID do bolão não informado." },
        { status: 400 }
      );
    }

    // Atualiza status para 'active' e define starts_at se estiver vazio
    const { data, error } = await supabase
      .from("pools")
      .update({
        status: "active",
        starts_at: new Date().toISOString(),
      })
      .eq("id", poolId)
      .select("id, status")
      .single();

    if (error || !data) {
      console.error("Erro ao ativar pool:", error);
      return NextResponse.json(
        { error: "Não foi possível ativar este bolão." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { poolId: data.id, status: data.status },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erro inesperado em /api/pools/[poolId]/activate:", err);
    return NextResponse.json(
      { error: "Erro interno ao ativar o bolão." },
      { status: 500 }
    );
  }
}
