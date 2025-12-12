"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

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

function prettyTournament(id: string | null): string {
  if (!id) return "Custom / misto";
  if (id === "world-cup-2026") return "Copa do Mundo 2026";
  if (id === "brasileirao-serie-a-2026")
    return "Campeonato Brasileiro Série A 2026";
  if (id === "champions-league-2025-2026")
    return "Champions League 2025-2026";
  return id;
}

export default function PoolJoinPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params?.poolId as string | undefined;

  const [pool, setPool] = useState<PoolInviteSummary | null>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setAuthUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    async function loadPool() {
      if (!poolId) return;

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/pools/${poolId}/join`);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.error ?? "Não foi possível carregar este bolão.");
          setLoading(false);
          return;
        }

        const poolData = data.pool as PoolInviteSummary;

        if (poolData.status !== "active") {
          setError(
            "Este bolão ainda não está ativo. Aguarde a confirmação do pagamento ou fale com o organizador."
          );
          setLoading(false);
          return;
        }

        setPool(poolData);
        setParticipantsCount(data.participantsCount ?? 0);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados do bolão:", err);
        setError("Erro inesperado ao carregar o convite do bolão.");
        setLoading(false);
      }
    }

    loadPool();
  }, [poolId]);

  const remainingSpots = useMemo(() => {
    if (!pool) return 0;
    return Math.max(pool.max_participants - participantsCount, 0);
  }, [pool, participantsCount]);

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!poolId || !pool) return;

    setError(null);
    setSuccess(null);

    if (!displayName.trim()) {
      setError("Digite seu nome ou apelido para entrar no bolão.");
      return;
    }

    if (remainingSpots <= 0) {
      setError("O bolão atingiu o limite de participantes.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/pools/${poolId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          whatsapp,
          userId: authUserId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error ?? "Não foi possível registrar sua participação."
        );
        setSubmitting(false);
        return;
      }

      if (data?.alreadyJoined) {
        setSuccess(data?.message ?? "Você já está inscrito neste bolão.");
        if (data?.entry?.id && typeof window !== "undefined") {
          localStorage.setItem(`bg_entry_${poolId}`, data.entry.id);
        }
        setSubmitting(false);
        return;
      }

      if (data?.entry?.id && typeof window !== "undefined") {
        localStorage.setItem(`bg_entry_${poolId}`, data.entry.id);
      }

      setSuccess("Inscrição confirmada! Aguarde a liberação dos palpites.");
      setParticipantsCount(data?.participantsCount ?? participantsCount + 1);
      setDisplayName("");
      setWhatsapp("");
      setSubmitting(false);
    } catch (err) {
      console.error("Erro ao registrar participação:", err);
      setError("Erro inesperado ao registrar sua participação.");
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/40 via-violet-500/25 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/35 via-emerald-500/25 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_50%_-50%,rgba(148,163,184,0.65),transparent_65%)] opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-slate-950/95 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              BracketGoal
            </p>
            <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
              Entrar no bolão
            </h1>
            <p className="mt-1 text-xs text-slate-300">
              Preencha seus dados para fazer parte deste bolão convidado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-100 transition hover:border-emerald-400/70 hover:bg-slate-900"
          >
            Voltar
          </button>
        </header>

        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
            Carregando dados do bolão...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {!loading && pool && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/60">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                    Convite ativo
                  </p>
                  <h2 className="text-lg font-semibold text-slate-50">
                    {pool.name}
                  </h2>
                  <p className="text-[12px] text-slate-300">
                    Organizador:{" "}
                    {pool.organizers?.[0]?.display_name ?? "Organizador"}
                  </p>
                </div>
                <div className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                  {pool.status === "active" ? "Bolão ativo" : pool.status}
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <span className="text-slate-400">Campeonato</span>
                  <span className="font-semibold text-slate-50">
                    {prettyTournament(pool.tournament_id)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <span className="text-slate-400">Jogos</span>
                  <span className="font-semibold text-slate-50">
                    {pool.num_matches ?? "?"} jogos
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <span className="text-slate-400">Acesso</span>
                  <span className="font-semibold text-slate-50">
                    {pool.access_type === "public" ? "Público" : "Privado"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <span className="text-slate-400">Vagas</span>
                  <span className="font-semibold text-emerald-300">
                    {participantsCount}/{pool.max_participants} ocupadas
                  </span>
                </div>
              </dl>

              {remainingSpots <= 0 && (
                <div className="mt-3 rounded-xl border border-amber-500/70 bg-amber-500/10 p-3 text-[11px] text-amber-100">
                  O bolão está cheio no momento. Fale com o organizador para
                  liberar vagas.
                </div>
              )}
            </section>

            <section className="space-y-3 rounded-2xl border border-emerald-500/70 bg-slate-950 p-5 shadow-lg shadow-emerald-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                    Confirmar presença
                  </p>
                  <h3 className="text-sm font-semibold text-slate-50">
                    Entre no bolão com seu nome ou apelido
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                  {remainingSpots} vagas disponíveis
                </span>
              </div>

              <form className="space-y-3" onSubmit={handleJoin}>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-300">
                    Nome ou apelido
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                    placeholder="Ex.: Maria, João, Fulano..."
                    disabled={submitting || remainingSpots <= 0}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-300">
                    WhatsApp (opcional)
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                    placeholder="(DDD) 9xxxx-xxxx"
                    disabled={submitting || remainingSpots <= 0}
                  />
                  <p className="text-[11px] text-slate-400">
                    Apenas o organizador verá seu WhatsApp para combinar
                    detalhes do bolão.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-[12px] text-red-100">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 p-3 text-[12px] text-emerald-100">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || remainingSpots <= 0}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Registrando..." : "Quero participar"}
                </button>
              </form>

              <p className="text-[11px] text-slate-400">
                Ao confirmar, seu nome entra na lista de participantes do bolão.
                Em breve você receberá instruções para enviar seus palpites e
                acompanhar o ranking.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
