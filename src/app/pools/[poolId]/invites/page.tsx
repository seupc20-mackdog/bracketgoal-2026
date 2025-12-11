"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

interface PoolBasic {
  id: string;
  name: string;
  slug: string;
  tournament_id: string | null;
  max_participants: number;
  status: string;
  access_type: "private" | "public" | null;
  num_matches: number | null;
  organizers: {
    owner_user_id: string | null;
    display_name: string | null;
    type: string | null;
  } | null;
}

interface PoolEntry {
  id: string;
  display_name: string;
  whatsapp: string | null;
  status: string;
  score: number | null;
  created_at: string | null;
}

function prettyTournament(id: string | null): string {
  if (!id) return "Custom / misto";
  if (id === "world-cup-2026") return "Copa do Mundo 2026";
  if (id === "brasileirao-serie-a-2026")
    return "Campeonato Brasileiro Série A 2026";
  if (id === "champions-league-2025-2026")
    return "Champions League 2025-2026";
  return id;
}

export default function PoolInvitesPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params?.poolId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<PoolBasic | null>(null);
  const [entries, setEntries] = useState<PoolEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [adding, setAdding] = useState(false);

  const [shareUrl, setShareUrl] = useState("");

  const inviteText = (customName?: string) =>
    `Convite para o bolão "${pool?.name ?? ""}" no BracketGoal.\n` +
    `Entre pelo link: ${shareUrl}` +
    (customName ? `\nNome sugerido para você: ${customName}` : "");

  useEffect(() => {
    async function loadData() {
      if (!poolId) return;

      try {
        setLoading(true);
        setError(null);

        const base =
          process.env.NEXT_PUBLIC_APP_URL ??
          (typeof window !== "undefined" ? window.location.origin : "");
        const cleanBase = base.replace(/\/+$/, "");
        setShareUrl(`${cleanBase}/pools/${poolId}/join`);

        // Verifica usuário logado
        const {
          data: { user },
          error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError || !user?.id) {
          setError(
            "Para gerenciar convites deste bolão, faça login com a conta do organizador."
          );
          setLoading(false);
          return;
        }

        // Carrega dados do bolão + organizer (relação 1-1)
        const { data: poolData, error: poolError } = await supabaseClient
          .from("pools")
          .select(
            `
            id,
            name,
            slug,
            tournament_id,
            max_participants,
            status,
            access_type,
            num_matches,
            organizers (
              owner_user_id,
              display_name,
              type
            )
          `
          )
          .eq("id", poolId)
          .single();

        if (poolError || !poolData) {
          console.error("Erro ao buscar pool:", poolError);
          setError("Não foi possível localizar este bolão.");
          setLoading(false);
          return;
        }

        const poolNormalized = poolData as unknown as PoolBasic;
        const organizerRow = poolNormalized.organizers;

        if (
          organizerRow?.owner_user_id &&
          organizerRow.owner_user_id !== user.id
        ) {
          setError("Você não é o organizador deste bolão.");
          setLoading(false);
          return;
        }

        setPool(poolNormalized);

        // Carrega participantes
        const { data: entriesData, error: entriesError } = await supabaseClient
          .from("pool_entries")
          .select(
            "id, display_name, whatsapp, status, score, created_at"
          )
          .eq("pool_id", poolId)
          .order("created_at", { ascending: true });

        if (entriesError) {
          console.error("Erro ao buscar entries:", entriesError);
          setError("Não foi possível carregar os participantes.");
          setLoading(false);
          return;
        }

        setEntries((entriesData ?? []) as PoolEntry[]);
        setLoading(false);
      } catch (err) {
        console.error("Erro inesperado ao carregar convites:", err);
        setError("Erro inesperado ao carregar convites do bolão.");
        setLoading(false);
      }
    }

    loadData();
  }, [poolId]);

  const handleCopyLink = async () => {
    try {
      if (!shareUrl) return;
      await navigator.clipboard.writeText(shareUrl);
      alert("Link de convite copiado para a área de transferência.");
    } catch {
      alert("Não foi possível copiar o link. Copie manualmente.");
    }
  };

  const handleWhatsAppInvite = () => {
    if (!shareUrl) return;
    const url = `https://wa.me/?text=${encodeURIComponent(inviteText())}`;
    window.open(url, "_blank");
  };

  const handleAddParticipant = async () => {
    if (!poolId || !pool) return;
    if (!newName.trim()) {
      alert("Informe pelo menos o nome do participante.");
      return;
    }

    if (entries.length >= pool.max_participants) {
      alert("Limite máximo de participantes atingido.");
      return;
    }

    try {
      setAdding(true);

      const { data, error } = await supabaseClient
        .from("pool_entries")
        .insert({
          pool_id: poolId,
          user_id: null,
          display_name: newName.trim(),
          whatsapp: newWhatsapp.trim() || null,
          status: "active",
          score: 0,
        })
        .select("id, display_name, whatsapp, status, score, created_at")
        .single();

      if (error || !data) {
        console.error("Erro ao inserir participante:", error);
        alert(
          "Não foi possível adicionar o participante. Verifique as políticas de acesso (RLS)."
        );
        setAdding(false);
        return;
      }

      setEntries((prev) => [...prev, data as PoolEntry]);
      setNewName("");
      setNewWhatsapp("");
      setAdding(false);
    } catch (err) {
      console.error("Erro inesperado ao adicionar participante:", err);
      alert("Erro inesperado ao adicionar participante.");
      setAdding(false);
    }
  };

  const organizerName =
    pool?.organizers?.display_name ?? "Organizador";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/40 via-violet-500/25 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/35 via-emerald-500/25 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_50%_-50%,rgba(148,163,184,0.65),transparent_65%)] opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-slate-950/95 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              BracketGoal 2026
            </p>
            <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
              Convites e participantes do bolão
            </h1>
            <p className="mt-1 text-xs text-slate-300">
              Use este painel para copiar o link de convite e registrar os
              participantes do seu bolão entre amigos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-100 transition hover:border-emerald-400/70 hover:bg-slate-900"
          >
            Voltar ao dashboard
          </button>
        </header>

        {loading && (
          <div className="mt-10 text-sm text-slate-300">
            Carregando dados do bolão e convites...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {!loading && pool && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]">
            {/* Coluna esquerda: resumo + link */}
            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/60">
              <h2 className="text-sm font-semibold text-slate-50">
                Resumo do bolão
              </h2>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Nome</dt>
                  <dd className="font-medium text-slate-50 text-right">
                    {pool.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Organizador</dt>
                  <dd className="font-medium text-slate-50 text-right">
                    {organizerName}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Campeonato</dt>
                  <dd className="font-medium text-slate-50 text-right">
                    {prettyTournament(pool.tournament_id)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Jogos</dt>
                  <dd className="font-medium text-slate-50">
                    {pool.num_matches ?? "—"} jogos
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Máx. participantes</dt>
                  <dd className="font-medium text-slate-50">
                    {pool.max_participants}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Acesso</dt>
                  <dd className="font-medium text-slate-50">
                    {pool.access_type === "public" ? "Público" : "Privado"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Status</dt>
                  <dd className="font-medium text-emerald-300">
                    {pool.status === "active"
                      ? "Ativo"
                      : pool.status === "draft"
                      ? "Rascunho"
                      : pool.status}
                  </dd>
                </div>
              </dl>

              {pool.status !== "active" && (
                <div className="mt-3 rounded-xl border border-amber-500/60 bg-amber-500/10 p-3 text-[11px] text-amber-100">
                  Este bolão ainda não está marcado como{" "}
                  <span className="font-semibold">ativo</span> na tabela{" "}
                  <code>pools</code>. Verifique o fluxo de checkout para
                  ativação completa.
                </div>
              )}

              <div className="mt-4 space-y-2">
                <h3 className="text-xs font-semibold text-slate-100">
                  Link de convite
                </h3>
                <p className="text-[11px] text-slate-400">
                  Compartilhe este link com amigos e familiares. A página{" "}
                  <code>/pools/[poolId]/join</code> já está disponível para que
                  cada convidado registre nome e WhatsApp.
                </p>
                <div className="mt-1 flex flex-col gap-2 text-xs">
                  <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
                    <code className="break-all text-slate-200">
                      {shareUrl || "Gerando link..."}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="self-start rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-60"
                    disabled={!shareUrl}
                  >
                    Copiar link de convite
                  </button>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleWhatsAppInvite}
                      className="rounded-full border border-emerald-400/70 bg-emerald-900/40 px-3 py-1.5 font-semibold text-emerald-100 transition hover:bg-emerald-800/50 disabled:opacity-60"
                      disabled={!shareUrl}
                    >
                      Enviar por WhatsApp
                    </button>
                    {/* Email removido por enquanto, foco em link + WhatsApp */}
                  </div>
                </div>
              </div>
            </section>

            {/* Coluna direita: participantes */}
            <section className="space-y-4 rounded-2xl border border-emerald-500/70 bg-slate-950 p-5 shadow-lg shadow-emerald-900/50">
              <h2 className="text-sm font-semibold text-slate-50">
                Participantes ({entries.length}/{pool.max_participants})
              </h2>

              {/* Form de novo participante */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs">
                <p className="font-semibold text-slate-100">
                  Adicionar participante manualmente
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Útil para registrar quem confirmou presença pelo WhatsApp,
                  pessoalmente ou por outro canal.
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-[1.1fr_1fr]">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                      placeholder="Ex.: João, Maria, Fulano..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300">
                      WhatsApp (opcional)
                    </label>
                    <input
                      type="text"
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                      placeholder="(DDD) 9xxxx-xxxx"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Cada participante pode ter um acesso no painel de palpites.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddParticipant}
                    className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-60"
                    disabled={adding}
                  >
                    {adding ? "Adicionando..." : "Adicionar"}
                  </button>
                </div>
              </div>

              {/* Lista de participantes */}
              <div className="space-y-2 text-xs">
                {entries.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    Nenhum participante registrado ainda. Use o formulário acima
                    ou compartilhe o link de convite.
                  </p>
                )}

                {entries.length > 0 && (
                  <ul className="space-y-2">
                    {entries.map((entry) => {
                      const scoreValue = Number(entry.score ?? 0);
                      const createdAtLabel = entry.created_at
                        ? new Date(entry.created_at).toLocaleDateString()
                        : "";

                      return (
                        <li
                          key={entry.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-50">
                              {entry.display_name}
                            </p>
                            {entry.whatsapp && (
                              <p className="text-[11px] text-slate-400">
                                WhatsApp: {entry.whatsapp}
                              </p>
                            )}
                            <p className="text-[11px] text-slate-500">
                              Status:{" "}
                              <span className="text-emerald-300">
                                {entry.status}
                              </span>{" "}
                              · Pontos: {scoreValue.toFixed(2)}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {createdAtLabel}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Em versões futuras, esta tela poderá gerar convites com token
                único, integração mais avançada com WhatsApp (API oficial) e
                permitir que cada participante finalize um cadastro próprio para
                preencher os palpites.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
