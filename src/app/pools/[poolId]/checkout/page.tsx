"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

interface PoolWithOrganizer {
  id: string;
  name: string;
  tournament_id: string | null;
  max_participants: number;
  payment_mode: string;
  price_per_entry: number | null;
  total_price: number | null;
  currency: string;
  status: string;
  num_matches: number | null;
  filter_hours: number | null;
  access_type: "private" | "public" | null;
  organizers: {
    owner_user_id: string | null;
    type: string;
    display_name: string;
  } | null;
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

export default function PoolCheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params?.poolId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<PoolWithOrganizer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function loadPool() {
      if (!poolId) return;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError || !user?.id) {
          setError(
            "Para acessar o checkout do bolão, faça login com a mesma conta que criou o bolão."
          );
          setLoading(false);
          return;
        }

        const { data, error } = await supabaseClient
          .from("pools")
          .select(
            `
            id,
            name,
            tournament_id,
            max_participants,
            payment_mode,
            price_per_entry,
            total_price,
            currency,
            status,
            num_matches,
            filter_hours,
            access_type,
            organizers (
              owner_user_id,
              type,
              display_name
            )
          `
          )
          .eq("id", poolId)
          .single();

        if (error || !data) {
          console.error("Erro ao buscar pool:", error);
          setError(
            "Não foi possível localizar este bolão. Verifique se ele existe e se você é o criador."
          );
          setLoading(false);
          return;
        }

        const poolData = data as unknown as PoolWithOrganizer;

        if (
          poolData.organizers?.owner_user_id &&
          poolData.organizers.owner_user_id !== user.id
        ) {
          setError("Este bolão pertence a outro organizador.");
          setLoading(false);
          return;
        }

        setPool(poolData);
        setLoading(false);
      } catch (err) {
        console.error("Erro inesperado ao carregar pool:", err);
        setError("Erro inesperado ao carregar os dados do bolão.");
        setLoading(false);
      }
    }

    loadPool();
  }, [poolId]);

  const handlePayService = async () => {
    if (!poolId || !pool) return;

    try {
      setPaying(true);

      const response = await fetch(`/api/pools/${poolId}/pay-service`, {
        method: "POST",
      });

      const data = await response.json().catch(() => null);
      console.log("Resposta /pay-service:", response.status, data);

      if (!response.ok) {
        console.error("Erro ao iniciar pagamento do serviço:", data);

        const msgDetalhe =
          data?.error ||
          data?.details?.message ||
          data?.details?.error ||
          (Array.isArray(data?.details?.cause) &&
            data.details.cause[0]?.description) ||
          JSON.stringify(data, null, 2);

        alert("Falha ao iniciar pagamento:\n\n" + msgDetalhe);
        setPaying(false);
        return;
      }

      const redirectUrl = data.initPoint ?? data.sandboxInitPoint;

      if (!redirectUrl) {
        alert(
          "Pagamento criado, mas não recebemos a URL de checkout do Mercado Pago."
        );
        setPaying(false);
        return;
      }

      // Redireciona para o checkout do Mercado Pago
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Erro inesperado ao iniciar pagamento:", error);
      alert("Erro inesperado ao iniciar o pagamento do serviço.");
      setPaying(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/40 via-violet-500/25 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/35 via-emerald-500/25 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_50%_-50%,rgba(148,163,184,0.65),transparent_65%)] opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-slate-950/95 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {/* Cabeçalho simples */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              BracketGoal 2026
            </p>
            <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
              Checkout do serviço do bolão
            </h1>
            <p className="mt-1 text-xs text-slate-300">
              Revise as informações do seu bolão entre amigos e confirme o valor
              do serviço antes de ativar.
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
            Carregando dados do bolão...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {!loading && pool && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
            {/* Resumo do bolão */}
            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/60">
              <h2 className="text-sm font-semibold text-slate-50">
                Resumo do bolão
              </h2>
              <p className="text-xs text-slate-300">
                Essas são as configurações que você definiu no modo Amigos. Após
                a ativação, você poderá convidar os participantes.
              </p>

              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Nome do bolão</dt>
                  <dd className="font-medium text-slate-50 text-right">
                    {pool.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Organizador</dt>
                  <dd className="font-medium text-slate-50 text-right">
                    {pool.organizers?.display_name ?? "Organizador"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Campeonato</dt>
                  <dd className="font-medium text-slate-50 text-right">
                    {prettyTournament(pool.tournament_id)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Jogos no bolão</dt>
                  <dd className="font-medium text-slate-50">
                    {pool.num_matches ?? "—"} jogos
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Janela de início</dt>
                  <dd className="font-medium text-slate-50">
                    {pool.filter_hours != null
                      ? `Até ${pool.filter_hours}h após criação`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Máx. jogadores</dt>
                  <dd className="font-medium text-slate-50">
                    {pool.max_participants} participantes
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Acesso</dt>
                  <dd className="font-medium text-slate-50">
                    {pool.access_type === "public" ? "Público" : "Privado"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Modo</dt>
                  <dd className="font-medium text-slate-50">
                    {pool.organizers?.type === "amigos"
                      ? "Modo Amigos"
                      : pool.organizers?.type ?? "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-300">
                <p className="font-semibold text-slate-100">
                  O que está incluído no serviço
                </p>
                <ul className="mt-1 list-disc pl-4">
                  <li>
                    Motor de bolão com carregamento automático dos jogos da
                    rodada.
                  </li>
                  <li>Painel de palpites com ranking automático.</li>
                  <li>Links de convite para participantes.</li>
                </ul>
              </div>
            </section>

            {/* Valor e confirmação */}
            <section className="space-y-4 rounded-2xl border border-emerald-500/70 bg-slate-950 p-5 shadow-lg shadow-emerald-900/50">
              <h2 className="text-sm font-semibold text-slate-50">
                Valor do serviço
              </h2>

              <div className="rounded-xl border border-emerald-500/60 bg-emerald-900/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  BracketGoal – Modo Amigos
                </p>
                <p className="mt-1 text-sm text-slate-50">
                  Bolão com {pool.num_matches ?? "—"} jogos e até{" "}
                  {pool.max_participants} participantes.
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-sm text-slate-300">Serviço:</span>
                  <span className="text-2xl font-bold text-emerald-300">
                    R$ {(pool.total_price ?? 0).toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-100/80">
                  O valor está salvo na coluna <code>total_price</code> da
                  tabela <code>pools</code>. Você pode ajustar a fórmula de
                  cálculo no backend conforme sua estratégia comercial.
                </p>
              </div>

              <div className="text-[11px] text-slate-300">
                <p className="font-semibold text-slate-100">
                  Importante sobre natureza do serviço
                </p>
                <p className="mt-1">
                  O BracketGoal oferece apenas infraestrutura de bolões
                  recreativos, painel de palpites e ranking. Você é responsável
                  por qualquer combinação de prêmios entre os participantes.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePayService}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-60"
                disabled={paying}
              >
                {paying
                  ? "Redirecionando para pagamento..."
                  : "Pagar serviço via Mercado Pago"}
              </button>

              <p className="text-[11px] text-slate-400">
                Em produção, este botão redireciona para o checkout do Mercado
                Pago. Após a confirmação do pagamento, o bolão será ativado e
                você será levado à tela de convites.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
