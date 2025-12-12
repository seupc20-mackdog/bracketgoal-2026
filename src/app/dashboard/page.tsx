"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

type AccessType = "private" | "public" | null;

type PoolStatus =
  | "draft"
  | "pending_payment"
  | "pending"
  | "active"
  | "finished"
  | "cancelled"
  | string;

type PoolRow = {
  id: string;
  name: string;
  status: PoolStatus;
  access_type: AccessType;
  max_participants: number;
  num_matches: number | null;
  created_at: string | null;
  organizers: {
    owner_user_id: string | null;
    display_name: string | null;
    type: string | null;
  }[] | null;
  pool_entries?: { count: number }[];
  payments?: {
    id: string;
    status: string | null;
    entry_id: string | null;
    created_at: string | null;
  }[];
};

type GroupKey = "draft" | "pending" | "active" | "closed";

function statusLabel(status: PoolStatus) {
  const s = (status || "").toLowerCase();
  if (s === "draft") return "Rascunho";
  if (s === "pending_payment" || s === "pending") return "Pagamento pendente";
  if (s === "active") return "Ativo";
  if (s === "finished" || s === "cancelled") return "Encerrado";
  return status;
}

function badgeClass(status: PoolStatus) {
  const s = (status || "").toLowerCase();
  if (s === "active")
    return "border-emerald-400/60 bg-emerald-500/10 text-emerald-100";
  if (s === "draft")
    return "border-amber-400/60 bg-amber-500/10 text-amber-100";
  if (s === "pending_payment" || s === "pending")
    return "border-amber-400/60 bg-amber-500/10 text-amber-100";
  if (s === "finished" || s === "cancelled")
    return "border-slate-700/70 bg-slate-900/50 text-slate-200";
  return "border-slate-700/70 bg-slate-900/50 text-slate-200";
}

function participantsCount(pool: PoolRow) {
  return pool.pool_entries?.[0]?.count ?? 0;
}

function lastServicePaymentStatus(pool: PoolRow): string | null {
  const services =
    pool.payments?.filter((p) => !p.entry_id) ?? [];
  if (!services.length) return null;
  const sorted = [...services].sort(
    (a, b) =>
      new Date(a.created_at ?? 0).getTime() -
      new Date(b.created_at ?? 0).getTime()
  );
  return (sorted.at(-1)?.status || null) as string | null;
}

function groupKey(pool: PoolRow): GroupKey {
  const s = (pool.status || "").toLowerCase();
  const lastPayment = (lastServicePaymentStatus(pool) || "").toLowerCase();
  if (s === "draft") return "draft";
  if (s === "active") return "active";
  if (s === "finished" || s === "cancelled") return "closed";
  if (s === "pending_payment" || s === "pending" || lastPayment === "pending")
    return "pending";
  return "draft";
}

export default function DashboardPage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [pools, setPools] = useState<PoolRow[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);
  const [poolsError, setPoolsError] = useState<string | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Erro ao buscar usuário:", error);
        setLoadingUser(false);
        return;
      }
      setUserEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
      setLoadingUser(false);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      try {
        setLoadingPools(true);
        setPoolsError(null);

        const { data, error } = await supabaseClient
          .from("pools")
          .select(
            `
            id,
            name,
            status,
            access_type,
            max_participants,
            num_matches,
            created_at,
            organizers!inner (
              owner_user_id,
              display_name,
              type
            ),
            pool_entries(count),
            payments!left(
              id,
              status,
              entry_id,
              created_at
            )
          `
          )
          .eq("organizers.owner_user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao carregar bolões:", error);
          setPoolsError(
            "Não foi possível carregar seus bolões. Verifique permissões e tente novamente."
          );
          setLoadingPools(false);
          return;
        }

        setPools((data ?? []) as PoolRow[]);
        setLoadingPools(false);
      } catch (err) {
        console.error("Erro inesperado ao listar bolões:", err);
        setPoolsError("Erro inesperado ao listar bolões.");
        setLoadingPools(false);
      }
    }

    load();
  }, [userId]);

  const grouped = useMemo(() => {
    const groups: Record<GroupKey, PoolRow[]> = {
      draft: [],
      pending: [],
      active: [],
      closed: [],
    };
    pools.forEach((p) => {
      groups[groupKey(p)].push(p);
    });
    return groups;
  }, [pools]);

  const metrics = useMemo(() => {
    const total = pools.length;
    const active = grouped.active.length;
    const draft = grouped.draft.length;
    const pending = grouped.pending.length;
    const closed = grouped.closed.length;
    return { total, active, draft, pending, closed };
  }, [pools, grouped]);

  async function handleSignOut() {
    await supabaseClient.auth.signOut();
    router.replace("/");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/35 via-violet-500/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/30 via-emerald-500/20 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-slate-950/95 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-12">
        <header className="flex flex-col gap-3 border-b border-slate-800/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Central de gestão de bolões
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Painel do organizador
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Veja seus bolões, finalize pagamentos e envie convites por link ou
              WhatsApp.
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>
              {loadingUser
                ? "Carregando sessão..."
                : userEmail ?? "Não autenticado"}
            </p>
            <div className="mt-2 flex items-center gap-2 justify-end">
              <Link
                href="/"
                className="hidden rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-emerald-400/60 hover:bg-slate-900 sm:inline-flex"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-100 transition hover:border-red-400/70 hover:bg-red-500/10"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {!loadingUser && !userId && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/85 p-5">
            <h2 className="text-lg font-semibold">Entre para criar bolões</h2>
            <p className="mt-1 text-sm text-slate-300">
              Faça login para criar, pagar e convidar participantes.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Voltar para Home
              </Link>
            </div>
          </section>
        )}

        {userId && (
          <>
            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Bolões" value={metrics.total} />
              <MetricCard label="Ativos" value={metrics.active} tone="good" />
              <MetricCard label="Rascunhos" value={metrics.draft} tone="warn" />
              <MetricCard
                label="Pag. pendente"
                value={metrics.pending}
                tone="warn"
              />
            </section>

            <section className="mt-6 space-y-6">
              <PoolGroup
                title="Rascunhos / Em criação"
                subtitle="Finalize configuração ou siga para checkout."
                pools={grouped.draft}
                loading={loadingPools}
                emptyText="Nenhum rascunho no momento."
                renderActions={(pool) => (
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <Link
                      href={`/pools/${pool.id}/checkout`}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-3 py-2 font-semibold text-slate-950 shadow-sm shadow-amber-500/30 transition hover:bg-amber-300"
                    >
                      Continuar configuração
                    </Link>
                    <Link
                      href={`/pools/${pool.id}/checkout`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-100"
                    >
                      Ir para checkout
                    </Link>
                  </div>
                )}
              />

              <PoolGroup
                title="Aguardando pagamento"
                subtitle="Conclua o pagamento do serviço para ativar e liberar convites."
                pools={grouped.pending}
                loading={loadingPools}
                emptyText="Nenhum bolão aguardando pagamento."
                renderActions={(pool) => (
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <Link
                      href={`/pools/${pool.id}/checkout`}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-3 py-2 font-semibold text-slate-950 shadow-sm shadow-amber-500/30 transition hover:bg-amber-300"
                    >
                      Finalizar pagamento
                    </Link>
                  </div>
                )}
              />

              <PoolGroup
                title="Ativos"
                subtitle="Envie convites e acompanhe ranking e palpites."
                pools={grouped.active}
                loading={loadingPools}
                emptyText="Nenhum bolão ativo ainda."
                renderActions={(pool) => (
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <Link
                      href={`/pools/${pool.id}/invites`}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-slate-950 shadow-emerald-500/30 transition hover:bg-emerald-400"
                    >
                      Gerenciar convites
                    </Link>
                    <Link
                      href={`/pools/${pool.id}/join`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-100"
                    >
                      Abrir palpites/ranking
                    </Link>
                  </div>
                )}
              />

              <PoolGroup
                title="Encerrados"
                subtitle="Histórico de bolões finalizados ou cancelados."
                pools={grouped.closed}
                loading={loadingPools}
                emptyText="Nenhum bolão encerrado."
                renderActions={(pool) => (
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <Link
                      href={`/pools/${pool.id}/invites`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-100"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                )}
              />
            </section>

            {poolsError && (
              <div className="mt-6 rounded-xl border border-red-500/60 bg-red-500/10 p-4 text-sm text-red-100">
                {poolsError}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

type MetricCardProps = {
  label: string;
  value: number;
  tone?: "good" | "warn" | "muted";
};

function MetricCard({ label, value, tone = "muted" }: MetricCardProps) {
  const toneClasses =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-100 border-emerald-500/50"
      : tone === "warn"
      ? "bg-amber-500/10 text-amber-100 border-amber-500/50"
      : "bg-slate-900/70 text-slate-100 border-slate-700/70";

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm shadow-sm shadow-black/20 ${toneClasses}`}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">
        {label}
      </p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

type PoolGroupProps = {
  title: string;
  subtitle: string;
  pools: PoolRow[];
  loading: boolean;
  emptyText: string;
  renderActions: (pool: PoolRow) => React.ReactNode;
};

function PoolGroup({
  title,
  subtitle,
  pools,
  loading,
  emptyText,
  renderActions,
}: PoolGroupProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/85 p-5 shadow-lg shadow-slate-950/60">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
            {title}
          </p>
          <p className="text-sm text-slate-300">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-200">
          {loading ? "Carregando..." : `${pools.length} bolão(ões)`}
        </span>
      </div>

      {loading && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-xl border border-slate-800 bg-slate-950/80 p-4"
            >
              <div className="h-4 w-24 rounded bg-slate-800" />
              <div className="mt-3 h-5 w-48 rounded bg-slate-800" />
              <div className="mt-2 h-3 w-64 rounded bg-slate-800" />
              <div className="mt-4 flex gap-2">
                <div className="h-8 w-24 rounded bg-slate-800" />
                <div className="h-8 w-32 rounded bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && pools.length === 0 && (
        <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-200">
          {emptyText}
        </p>
      )}

      {!loading && pools.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pools.map((pool) => {
            const count = participantsCount(pool);
            const max = pool.max_participants ?? 0;
            const pendingInvites = Math.max(max - count, 0);
            return (
              <article
                key={pool.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/90 p-4 shadow-md shadow-black/30"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-50">
                      {pool.name}
                    </h3>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold ${badgeClass(
                        pool.status
                      )}`}
                    >
                      {statusLabel(pool.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Organizador:{" "}
                    {pool.organizers?.[0]?.display_name ?? "Você"}
                  </p>

                  <dl className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2">
                      <dt className="text-slate-400">Participantes</dt>
                      <dd className="font-semibold text-slate-100">
                        {count}/{max || "—"}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2">
                      <dt className="text-slate-400">Convites</dt>
                      <dd className="font-semibold text-slate-100">
                        {pendingInvites > 0
                          ? `${pendingInvites} vagas`
                          : "—"}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2">
                      <dt className="text-slate-400">Acesso</dt>
                      <dd className="font-semibold text-slate-100">
                        {pool.access_type === "public" ? "Público" : "Privado"}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2">
                      <dt className="text-slate-400">Jogos</dt>
                      <dd className="font-semibold text-slate-100">
                        {pool.num_matches ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-3">{renderActions(pool)}</div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
