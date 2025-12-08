"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) {
        console.error("Erro ao buscar usuário:", error);
        setLoadingUser(false);
        return;
      }
      setUserEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  async function handleSignOut() {
    await supabaseClient.auth.signOut();
    router.push("/");
  }

  const isLogged = !!userEmail;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Fundo “estádio noturno” */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/40 via-violet-500/25 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/35 via-emerald-500/25 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_50%_-50%,rgba(148,163,184,0.65),transparent_65%)] opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-slate-950/95 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-12">
        {/* Cabeçalho */}
        <header className="flex flex-col gap-4 border-b border-slate-800/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Ícone da marca (pode trocar por <Image src="/logo.svg" />) */}
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-500 shadow-lg shadow-emerald-500/40">
              <span className="text-xs font-black tracking-tight text-slate-950">
                BG
              </span>
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                BracketGoal 2026
              </p>
              <p className="text-xs text-slate-400">
                Painel dos seus bolões recreativos da Copa do Mundo.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <p className="text-xs text-slate-400">
              {isLogged ? "Olá," : "Sessão atual:"}{" "}
              <span className="font-medium text-slate-50">
                {loadingUser
                  ? "carregando..."
                  : userEmail ?? "usuário anônimo"}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="hidden rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-emerald-400/60 hover:bg-slate-900 sm:inline-flex"
              >
                Voltar à Home
              </button>
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

        {/* Topo do painel */}
        <section className="mt-6 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-emerald-200">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-xs">
              🏆
            </span>
            <span className="uppercase tracking-[0.18em]">
              Dashboard · Copa do Mundo 2026
            </span>
          </div>
          <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Meu painel
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-300">
                Acompanhe seus palpites, veja o andamento da Copa do Mundo 2026
                e prepare novos bolões para empresas, comunidade ou amigos.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400 md:justify-end">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
                MVP técnico em desenvolvimento
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1">
                Rankings corporativos e de creators no roadmap
              </span>
            </div>
          </div>
        </section>

        {/* Hero + status rápido */}
        <section className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)]">
          {/* Card principal Copa 2026 */}
          <article className="flex flex-col justify-between rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-900/80 via-slate-950 to-black/90 p-5 shadow-xl shadow-emerald-900/50 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-amber-200 ring-1 ring-amber-300/50">
                <span className="text-xs">🌍</span>
                <span className="uppercase tracking-[0.16em]">
                  World Cup 2026 Pool
                </span>
              </div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Bolão Copa do Mundo 2026 –{" "}
                <span className="text-emerald-200">meus palpites</span>
              </h2>
              <p className="max-w-xl text-sm text-emerald-50/90">
                Este é o torneio base da plataforma. Aqui você preenche os
                palpites da fase de grupos, acompanha o avanço no chaveamento e
                alimenta rankings de empresas, influenciadores ou grupos de
                amigos.
              </p>

              {/* Mini stats */}
              <dl className="mt-3 grid gap-3 text-xs text-emerald-50/90 sm:grid-cols-3">
                <DashboardStat
                  label="Status"
                  value="Fase de grupos"
                  hint="Palpites disponíveis"
                />
                <DashboardStat
                  label="Formato"
                  value="Grupos + mata-mata"
                  hint="A até L + playoffs"
                />
                <DashboardStat
                  label="Ranking"
                  value="Automático"
                  hint="Por pontos de palpite"
                />
              </dl>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/tournaments/world-cup-2026/palpites"
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/40 transition hover:bg-amber-300"
              >
                Ir para meus palpites
                <span className="ml-2 text-xs">↗</span>
              </Link>
              <p className="max-w-md text-[11px] text-emerald-50/80">
                Seu desempenho neste torneio poderá ser usado em rankings
                corporativos, de streamers e de grupos privados em versões
                futuras do BracketGoal.
              </p>
            </div>
          </article>

          {/* Card lateral: visão geral */}
          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/85 p-5 shadow-lg shadow-slate-950/70 backdrop-blur-sm">
            <div>
              <h3 className="text-sm font-semibold text-slate-50">
                Visão geral da Copa 2026
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                Grupos definidos, aguardando definição final das repescagens.
                Durante a Copa, este painel será o seu “hub” rápido.
              </p>
            </div>

            <ul className="space-y-2 text-xs">
              <StatusRow
                label="Fase de grupos"
                status="Palpites em andamento"
                tone="active"
              />
              <StatusRow
                label="Mata-mata"
                status="Disponível em breve"
                tone="soon"
              />
              <StatusRow
                label="Ranking global"
                status="MVP em construção"
                tone="disabled"
              />
            </ul>

            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-[11px] text-slate-300">
              <p className="font-semibold text-slate-100">
                Experiência “TV da Copa”
              </p>
              <p className="mt-1">
                As telas de palpites usam layout inspirado em transmissão
                oficial: grupos compactos, bandeiras, barra de progresso e
                chaveamento visual.
              </p>
            </div>
          </aside>
        </section>

        {/* Modos de uso (Amigos / Empresa / Influencer) */}
        <ModesSection ownerEmail={userEmail} ownerUserId={userId} />
      </div>
    </main>
  );
}

/* === Componentes visuais de apoio === */

function DashboardStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-400/30 bg-black/20 p-2.5">
      <dt className="text-[11px] text-emerald-100/80">{label}</dt>
      <dd className="text-sm font-semibold text-emerald-50">{value}</dd>
      {hint && (
        <p className="mt-0.5 text-[10px] text-emerald-50/70">{hint}</p>
      )}
    </div>
  );
}

type StatusTone = "active" | "soon" | "disabled";

function StatusRow({
  label,
  status,
  tone,
}: {
  label: string;
  status: string;
  tone: StatusTone;
}) {
  const colorMap: Record<StatusTone, string> = {
    active: "text-emerald-300",
    soon: "text-amber-300",
    disabled: "text-slate-500",
  };

  const dotMap: Record<StatusTone, string> = {
    active: "bg-emerald-400",
    soon: "bg-amber-400",
    disabled: "bg-slate-500",
  };

  return (
    <li className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/80 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-slate-200">
        <span className={`h-1.5 w-1.5 rounded-full ${dotMap[tone]}`} />
        <span>{label}</span>
      </div>
      <span className={`text-[11px] font-medium ${colorMap[tone]}`}>
        {status}
      </span>
    </li>
  );
}

/* === Modos de uso + Wizard Modo Amigos === */

type TournamentType =
  | "worldcup_2026"
  | "brasileirao_2026"
  | "champions_league"
  | "custom";

type AccessType = "private" | "public";

interface FriendPoolConfig {
  tournamentType: TournamentType;
  poolName: string;
  numMatches: 5 | 6 | 10;
  filterHours: number;
  maxPlayers: number;
  accessType: AccessType;
  acceptTerms: boolean;
  acceptRecreationalOnly: boolean;
}

const initialFriendConfig: FriendPoolConfig = {
  tournamentType: "worldcup_2026",
  poolName: "Bolão entre amigos",
  numMatches: 5,
  filterHours: 24,
  maxPlayers: 10,
  accessType: "private",
  acceptTerms: false,
  acceptRecreationalOnly: false,
};

function ModesSection({
  ownerEmail,
  ownerUserId,
}: {
  ownerEmail: string | null;
  ownerUserId: string | null;
}) {
  const router = useRouter();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<FriendPoolConfig>(initialFriendConfig);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  function openWizard() {
    setConfig(initialFriendConfig);
    setStep(1);
    setIsWizardOpen(true);
  }

  function closeWizard() {
    if (isSubmitting) return;
    setIsWizardOpen(false);
  }

  function nextStep() {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  }

  function prevStep() {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  }

  function setTournamentType(value: TournamentType) {
    setConfig((prev) => ({ ...prev, tournamentType: value }));
  }

  function setNumMatches(value: 5 | 6 | 10) {
    setConfig((prev) => ({ ...prev, numMatches: value }));
  }

  function setMaxPlayers(value: number) {
    if (value < 2) value = 2;
    if (value > 500) value = 500;
    setConfig((prev) => ({ ...prev, maxPlayers: value }));
  }

  function setAccessType(value: AccessType) {
    setConfig((prev) => ({ ...prev, accessType: value }));
  }

  async function handleConfirm() {
    if (!ownerUserId || !ownerEmail) {
      alert("Faça login para criar um bolão.");
      return;
    }

    if (!config.acceptTerms || !config.acceptRecreationalOnly) {
      alert(
        "Você precisa aceitar os termos e confirmar que o bolão é recreativo."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "friends",
          ownerUserId,
          ownerEmail,
          config,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error("Erro ao criar bolão:", data);
        alert(
          data?.error ??
            "Não foi possível criar o bolão. Tente novamente em alguns instantes."
        );
        return;
      }

      const json = (await response.json()) as { poolId: string };

      if (!json.poolId) {
        alert(
          "Bolão criado, mas não foi possível obter o identificador. Verifique o backend."
        );
        return;
      }

      router.push(`/pools/${json.poolId}/checkout`);
    } catch (error) {
      console.error("Erro inesperado ao criar bolão:", error);
      alert("Erro inesperado ao criar bolão. Verifique os logs.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-8 space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">
            Modos de uso do{" "}
            <span className="text-emerald-300">BracketGoal</span>
          </h2>
          <p className="max-w-2xl text-sm text-slate-300">
            Crie bolões recreativos entre amigos agora e acompanhe o roadmap
            para versões corporativas e para criadores de conteúdo.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Roadmap · Pós-MVP
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Modo Amigos */}
        <article className="flex flex-col justify-between rounded-2xl border border-emerald-500/70 bg-slate-950/95 p-5 shadow-lg shadow-emerald-900/60 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] text-emerald-200 ring-1 ring-emerald-500/60">
              <span>👥</span>
              <span className="uppercase tracking-[0.16em]">Modo Amigos</span>
            </div>
            <h3 className="text-base font-semibold text-slate-50">
              Bolões recreativos entre amigos
            </h3>
            <p className="text-sm text-slate-200">
              Crie um bolão rápido para grupos de amigos, família ou colegas.
              Você paga o serviço, define os jogos e convida quem quiser para
              participar.
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-slate-200">
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                <span>
                  Escolha campeonato (ex.: Copa do Mundo 2026, Brasileirão 2026).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                <span>
                  Selecione 5, 6 ou 10 jogos da próxima rodada com filtro de até
                  24h.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                <span>
                  Defina limite de jogadores e convide via link, e-mail ou
                  outros canais.
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={openWizard}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
            >
              Criar bolão entre amigos
            </button>
            <span className="text-[11px] text-slate-400">
              Fluxo inicial de criação de bolão (MVP).
            </span>
          </div>
        </article>

        {/* Modo Empresa */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/80 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/80">
              <span>👔</span>
              <span className="uppercase tracking-[0.16em]">Modo Empresa</span>
            </div>
            <h3 className="text-base font-semibold text-slate-50">
              Bolão corporativo para equipes internas
            </h3>
            <p className="text-sm text-slate-300">
              Crie experiências de engajamento com times, áreas e filiais,
              usando o mesmo painel de palpites, mas com{" "}
              <span className="font-semibold text-emerald-200">
                ranking privado, branding da empresa
              </span>{" "}
              e regras próprias.
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300">
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                <span>Convite via e-mail corporativo ou link interno.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                <span>Ranking por área, diretoria ou geral da empresa.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                <span>Relatórios para RH e comunicação interna.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Funcionalidade planejada para versões futuras.</span>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-dashed border-slate-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400"
            >
              Em breve
            </button>
          </div>
        </article>

        {/* Modo Influencer / Streamer */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/80 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/80">
              <span>📺</span>
              <span className="uppercase tracking-[0.16em]">
                Modo Influencer / Streamer
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-50">
              Bolões para inscritos, membros e comunidade
            </h3>
            <p className="text-sm text-slate-300">
              Use a Copa como motor de engajamento para o seu canal: bolões com{" "}
              <span className="font-semibold text-emerald-200">
                URL própria, identidade visual do criador
              </span>{" "}
              e ranking apenas da sua audiência.
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300">
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                <span>Link compartilhável em live, bio, Discord, etc.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                <span>Ranking só de inscritos, membros ou apoiadores.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                <span>
                  Integrações com chat da live e comandos automáticos no
                  roadmap.
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Integrações com Twitch, YouTube e Discord planejadas.</span>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-dashed border-slate-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400"
            >
              Em breve
            </button>
          </div>
        </article>
      </div>

      {/* Modal / Wizard Modo Amigos */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/70">
            {/* Cabeçalho */}
            <div className="border-b border-slate-800 px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    Criar bolão entre amigos
                  </h2>
                  <p className="text-xs text-slate-400">
                    Passo {step} de {totalSteps}
                  </p>
                </div>
                <button
                  onClick={closeWizard}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  aria-label="Fechar"
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-sm text-slate-100">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-50">
                    1. Tipo de bolão
                  </h3>
                  <p className="text-xs text-slate-400">
                    Escolha o campeonato e dê um nome para o seu bolão. No MVP,
                    vamos pré-configurar as regras a partir desta escolha.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-200">
                      Campeonato / torneio
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setTournamentType("worldcup_2026")}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.tournamentType === "worldcup_2026"
                            ? "border-emerald-500 bg-emerald-900/40 text-emerald-100"
                            : "border-slate-700 bg-slate-950 hover:border-emerald-400 hover:bg-slate-900"
                        }`}
                      >
                        <span className="block font-semibold">
                          Copa do Mundo 2026
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          Ideal para fase de grupos e mata-mata.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTournamentType("brasileirao_2026")}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.tournamentType === "brasileirao_2026"
                            ? "border-emerald-500 bg-emerald-900/40 text-emerald-100"
                            : "border-slate-700 bg-slate-950 hover:border-emerald-400 hover:bg-slate-900"
                        }`}
                      >
                        <span className="block font-semibold">
                          Campeonato Brasileiro 2026
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          Usa sempre a próxima rodada como base.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTournamentType("champions_league")}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.tournamentType === "champions_league"
                            ? "border-emerald-500 bg-emerald-900/40 text-emerald-100"
                            : "border-slate-700 bg-slate-950 hover:border-emerald-400 hover:bg-slate-900"
                        }`}
                      >
                        <span className="block font-semibold">
                          Champions League
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          Ideal para fases eliminatórias.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTournamentType("custom")}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.tournamentType === "custom"
                            ? "border-emerald-500 bg-emerald-900/40 text-emerald-100"
                            : "border-slate-700 bg-slate-950 hover:border-emerald-400 hover:bg-slate-900"
                        }`}
                      >
                        <span className="block font-semibold">Outro torneio</span>
                        <span className="block text-[11px] text-slate-400">
                          Futuras ligas e campeonatos personalizados.
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-200">
                      Nome do bolão
                    </label>
                    <input
                      type="text"
                      value={config.poolName}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          poolName: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                      placeholder="Ex.: Bolão da Firma 2026, Família na Copa, etc."
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-50">
                    2. Estrutura de jogos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina quantos jogos farão parte do seu bolão. O sistema
                    irá buscar automaticamente partidas que começam nas próximas{" "}
                    {config.filterHours} horas, usando a próxima rodada do
                    campeonato escolhido.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-200">
                      Quantidade de jogos por bolão
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 6, 10].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNumMatches(n as 5 | 6 | 10)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                            config.numMatches === n
                              ? "border-emerald-500 bg-emerald-900/40 text-emerald-100"
                              : "border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-400 hover:bg-slate-900"
                          }`}
                        >
                          {n} jogos
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-200">
                      Janela de início dos jogos (em horas)
                    </label>
                    <input
                      type="number"
                      min={6}
                      max={72}
                      value={config.filterHours}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          filterHours: Number(e.target.value) || 24,
                        }))
                      }
                      className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Ex.: 24 horas significa que só entram jogos que começam
                      até 24h depois da criação do bolão.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-50">
                    3. Jogadores e acesso
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina quantas pessoas podem participar e se o bolão será
                    privado (apenas quem tem o link) ou público (qualquer pessoa
                    com o link, ideal para comunidades).
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-200">
                      Número máximo de jogadores
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={500}
                      value={config.maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value) || 10)}
                      className="w-32 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-50 outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Você poderá convidar via link, e-mail ou outros canais nas
                      próximas iterações do produto.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-200">
                      Tipo de acesso
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAccessType("private")}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.accessType === "private"
                            ? "border-emerald-500 bg-emerald-900/40 text-emerald-100"
                            : "border-slate-700 bg-slate-950 hover:border-emerald-400 hover:bg-slate-900"
                        }`}
                      >
                        <span className="block font-semibold">Privado</span>
                        <span className="block text-[11px] text-slate-400">
                          Apenas quem recebe o link/convite consegue entrar.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccessType("public")}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.accessType === "public"
                            ? "border-emerald-500 bg-emerald-900/40 text-emerald-100"
                            : "border-slate-700 bg-slate-950 hover:border-emerald-400 hover:bg-slate-900"
                        }`}
                      >
                        <span className="block font-semibold">Público</span>
                        <span className="block text-[11px] text-slate-400">
                          Qualquer pessoa com o link pode participar (ideal para
                          criadores).
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-50">
                    4. Resumo e termos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Confira se está tudo certo antes de avançar para a etapa de
                    pagamento do serviço (checkout).
                  </p>

                  <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100">Resumo</span>
                    </div>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Nome do bolão</dt>
                        <dd className="font-medium text-slate-50">
                          {config.poolName}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Campeonato</dt>
                        <dd className="font-medium text-slate-50">
                          {config.tournamentType === "worldcup_2026" &&
                            "Copa do Mundo 2026"}
                          {config.tournamentType === "brasileirao_2026" &&
                            "Campeonato Brasileiro 2026"}
                          {config.tournamentType === "champions_league" &&
                            "Champions League"}
                          {config.tournamentType === "custom" && "Outro torneio"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Jogos no bolão</dt>
                        <dd className="font-medium text-slate-50">
                          {config.numMatches} jogos
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Janela de início</dt>
                        <dd className="font-medium text-slate-50">
                          Até {config.filterHours}h após criação
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Máx. jogadores</dt>
                        <dd className="font-medium text-slate-50">
                          {config.maxPlayers} participantes
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Acesso</dt>
                        <dd className="font-medium text-slate-50">
                          {config.accessType === "private" ? "Privado" : "Público"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-2 text-xs text-slate-200">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-[2px]"
                        checked={config.acceptTerms}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            acceptTerms: e.target.checked,
                          }))
                        }
                      />
                      <span>
                        Declaro que li e concordo com os Termos de Uso e condições
                        do serviço BracketGoal.
                      </span>
                    </label>

                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-[2px]"
                        checked={config.acceptRecreationalOnly}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            acceptRecreationalOnly: e.target.checked,
                          }))
                        }
                      />
                      <span>
                        Confirmo que este bolão é exclusivamente recreativo, sem
                        enquadramento como casa de apostas ou operação de jogo.
                      </span>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Após esta confirmação, você será direcionado para a página de
                    checkout do serviço, onde verá o valor e os próximos passos para
                    ativar o seu bolão.
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé (botões) */}
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
              <button
                onClick={step === 1 ? closeWizard : prevStep}
                className="text-xs font-medium text-slate-300 hover:text-slate-100"
                disabled={isSubmitting}
              >
                {step === 1 ? "Cancelar" : "Voltar"}
              </button>

              <div className="flex items-center gap-2">
                {step < totalSteps && (
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400"
                    disabled={isSubmitting}
                  >
                    Continuar
                  </button>
                )}

                {step === totalSteps && (
                  <button
                    onClick={handleConfirm}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Criando bolão..."
                      : "Confirmar e ir para checkout"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
