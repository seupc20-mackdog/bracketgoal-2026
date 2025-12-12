"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  derivePoolPhase,
  formatCountdown,
  isMatchLocked,
  type PoolPhase,
} from "@/lib/picks";

type PoolSummary = {
  id: string;
  name: string;
  status: string;
  starts_at?: string | null;
  ends_at?: string | null;
};

type PoolEntry = {
  id: string;
  user_id: string | null;
  display_name: string;
  status: string;
};

type MatchCard = {
  pool_match_id: string;
  match_id: string;
  starts_at?: string | null;
  status?: string | null;
  home_team?: string | null;
  away_team?: string | null;
  home_flag?: string | null;
  away_flag?: string | null;
};

type PredictionMap = Record<
  string,
  { home_goals: number | null; away_goals: number | null }
>;

export default function PalpitesPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params?.poolId as string | undefined;

  const [userId, setUserId] = useState<string | null>(null);

  const [pool, setPool] = useState<PoolSummary | null>(null);
  const [entry, setEntry] = useState<PoolEntry | null>(null);
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [predictions, setPredictions] = useState<PredictionMap>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!poolId) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const entryFromStorage =
          typeof window !== "undefined"
            ? localStorage.getItem(`bg_entry_${poolId}`)
            : null;

        const [{ data: poolData, error: poolError }] = await Promise.all([
          supabaseClient
            .from("pools")
            .select("id, name, status, starts_at, ends_at")
            .eq("id", poolId)
            .single(),
        ]);

        if (poolError || !poolData) {
          setError("Bolão não encontrado.");
          setLoading(false);
          return;
        }

        setPool(poolData as PoolSummary);

        // Resolve entry: prioridade userId -> localStorage
        let resolvedEntry: PoolEntry | null = null;

        if (userId) {
          const { data: entryByUser } = await supabaseClient
            .from("pool_entries")
            .select("id, user_id, display_name, status")
            .eq("pool_id", poolId)
            .eq("user_id", userId)
            .maybeSingle();

          if (entryByUser) {
            resolvedEntry = entryByUser as PoolEntry;
          }
        }

        if (!resolvedEntry && entryFromStorage) {
          const { data: entryById } = await supabaseClient
            .from("pool_entries")
            .select("id, user_id, display_name, status")
            .eq("pool_id", poolId)
            .eq("id", entryFromStorage)
            .maybeSingle();

          if (entryById) {
            resolvedEntry = entryById as PoolEntry;
          }
        }

        if (!resolvedEntry) {
          router.replace(`/pools/${poolId}/join`);
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(`bg_entry_${poolId}`, resolvedEntry.id);
        }

        setEntry(resolvedEntry);

        const { data: matchesData, error: matchesError } = await supabaseClient
          .from("pool_matches")
          .select(
            `
            id,
            match_id,
            starts_at,
            status,
            matches (
              id,
              home_team,
              away_team,
              start_at,
              status
            )
          `
          )
          .eq("pool_id", poolId)
          .order("starts_at", { ascending: true });

        if (matchesError) {
          setError("Não foi possível carregar os jogos.");
          setLoading(false);
          return;
        }

        const normalizedMatches: MatchCard[] =
          (matchesData ?? []).map((m: any) => ({
            pool_match_id: m.id,
            match_id: m.match_id ?? m.matches?.id ?? m.id,
            starts_at: m.starts_at ?? m.matches?.start_at ?? null,
            status: m.status ?? m.matches?.status ?? null,
            home_team: m.matches?.home_team ?? "Time A",
            away_team: m.matches?.away_team ?? "Time B",
            home_flag: null,
            away_flag: null,
          })) ?? [];

        setMatches(normalizedMatches);

        const { data: predsData } = await supabaseClient
          .from("predictions")
          .select("match_id, home_goals, away_goals")
          .eq("pool_id", poolId)
          .eq("entry_id", resolvedEntry.id);

        const preds: PredictionMap = {};
        (predsData ?? []).forEach((p: any) => {
          const matchId = String(p.match_id);
          preds[matchId] = {
            home_goals: p.home_goals ?? null,
            away_goals: p.away_goals ?? null,
          };
        });

        setPredictions(preds);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar palpites:", err);
        setError("Erro inesperado ao carregar esta página.");
        setLoading(false);
      }
    }

    load();
  }, [poolId, userId, router]);

  const poolPhase: PoolPhase = useMemo(() => derivePoolPhase(pool), [pool]);

  const progress = useMemo(() => {
    const total = matches.length;
    if (total === 0) return { filled: 0, total: 0 };
    const filled = matches.filter((m) => {
      const p = predictions[m.match_id];
      return p && p.home_goals !== null && p.away_goals !== null;
    }).length;
    return { filled, total };
  }, [matches, predictions]);

  const lockedAll =
    poolPhase === "palpites_encerrados" || poolPhase === "finalizado";

  const countdown = formatCountdown(pool?.starts_at ?? null);

  function handleScoreChange(
    matchId: string,
    field: "home_goals" | "away_goals",
    value: string
  ) {
    setPredictions((prev) => {
      const current = prev[matchId] ?? { home_goals: null, away_goals: null };
      const parsed =
        value === "" || Number.isNaN(Number(value)) ? null : Number(value);
      return {
        ...prev,
        [matchId]: { ...current, [field]: parsed },
      };
    });
    setFeedback(null);
    setDirty(true);
  }

  async function handleSave() {
    if (!entry || !poolId) return;
    setSaving(true);
    setFeedback(null);
    setError(null);
    setDirty(false);

    try {
      const rows = matches.map((m) => {
        const p = predictions[m.match_id] ?? {
          home_goals: null,
          away_goals: null,
        };
        return {
          pool_id: poolId,
          entry_id: entry.id,
          match_id: m.match_id,
          home_goals: p.home_goals,
          away_goals: p.away_goals,
        };
      });

      const { error: upsertError } = await supabaseClient
        .from("predictions")
        .upsert(rows, { onConflict: "pool_id,entry_id,match_id" });

      if (upsertError) {
        setError("Não foi possível salvar seus palpites. Tente novamente.");
        setSaving(false);
        return;
      }

      setFeedback("Palpites salvos!");
      setSaving(false);
    } catch (err) {
      console.error("Erro ao salvar palpites:", err);
      setError("Erro inesperado ao salvar.");
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!dirty || saving || !entry || !poolId) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, predictions]);

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/30 via-violet-500/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/25 via-emerald-500/20 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-slate-950/95 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-800/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-emerald-900 bg-slate-950">
              <Image
                src="/brand/bracketgoal-icon-512.png"
                alt="BracketGoal"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Palpites
              </p>
              <h1 className="text-xl font-semibold sm:text-2xl">
                {pool?.name ?? "Bolão"}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-100">
              Status: {phaseLabel(poolPhase)}
            </span>
            {countdown && (
              <span className="rounded-full border border-amber-400/50 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-100">
                Encerra em {countdown}
              </span>
            )}
            <span className="text-[12px] text-slate-400">
              Progresso: {progress.filled}/{progress.total} palpites preenchidos
            </span>
          </div>
          {error && (
            <div className="rounded-xl border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
          {feedback && (
            <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              {feedback}
            </div>
          )}
        </header>

        {loading && (
          <p className="mt-6 text-sm text-slate-300">Carregando partidas...</p>
        )}

        {!loading && matches.length === 0 && (
          <p className="mt-6 text-sm text-slate-300">
            Nenhum jogo disponível para palpitar.
          </p>
        )}

        <section className="mt-6 space-y-3">
          {matches.map((match) => {
            const matchId = match.match_id;
            const pred = predictions[matchId] ?? {
              home_goals: null,
              away_goals: null,
            };
            const locked = lockedAll || isMatchLocked(match, poolPhase);
            const startLabel = match.starts_at
              ? new Date(match.starts_at).toLocaleString()
              : "Data a confirmar";

            return (
              <article
                key={match.pool_match_id}
                className="rounded-2xl border border-slate-800 bg-slate-950/85 p-4 shadow-md shadow-black/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Jogo
                    </p>
                    <p className="text-sm font-semibold text-slate-50">
                      {match.home_team ?? "Time A"} x {match.away_team ?? "Time B"}
                    </p>
                    <p className="text-[11px] text-slate-400">{startLabel}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold ${
                      locked
                        ? "border-slate-700 bg-slate-900 text-slate-300"
                        : "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                    }`}
                  >
                    {locked ? "Bloqueado" : "Aberto"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center text-sm font-semibold">
                  <TeamBox name={match.home_team} flag={match.home_flag} />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      disabled={locked}
                      value={pred.home_goals ?? ""}
                      onChange={(e) =>
                        handleScoreChange(matchId, "home_goals", e.target.value)
                      }
                      className="w-14 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-center text-sm text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1 disabled:opacity-60"
                    />
                    <span className="text-slate-400">x</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      disabled={locked}
                      value={pred.away_goals ?? ""}
                      onChange={(e) =>
                        handleScoreChange(matchId, "away_goals", e.target.value)
                      }
                      className="w-14 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-center text-sm text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1 disabled:opacity-60"
                    />
                  </div>
                  <TeamBox name={match.away_team} flag={match.away_flag} />
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800/70 bg-slate-950/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            <p className="font-semibold text-slate-100">
              Progresso: {progress.filled}/{progress.total}
            </p>
            <p className="text-[11px] text-slate-400">
              Preencha todos os palpites e salve antes do início das partidas.
            </p>
          </div>
          <button
            type="button"
            disabled={saving || lockedAll || matches.length === 0}
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando..." : lockedAll ? "Palpites encerrados" : "Salvar palpites"}
          </button>
        </div>
      </div>
    </main>
  );
}

function phaseLabel(phase: PoolPhase): string {
  if (phase === "aguardando_palpite") return "Aguardando palpites";
  if (phase === "palpites_encerrados") return "Palpites encerrados";
  if (phase === "em_andamento") return "Em andamento";
  return "Finalizado";
}

function TeamBox({ name, flag }: { name?: string | null; flag?: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
      {flag ? (
        <Image
          src={flag}
          alt={name ?? "Time"}
          width={28}
          height={20}
          className="h-5 w-7 rounded object-cover"
        />
      ) : (
        <span className="h-5 w-7 rounded bg-slate-800" />
      )}
      <span className="text-xs font-semibold text-slate-50 text-center">
        {name ?? "Time"}
      </span>
    </div>
  );
}
