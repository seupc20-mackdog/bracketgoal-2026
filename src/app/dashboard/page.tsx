"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

        {/* Modos de uso (Empresa / Influencer) */}
        <section className="mt-8 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">
                Modos de uso do{" "}
                <span className="text-emerald-300">BracketGoal</span>
              </h2>
              <p className="max-w-2xl text-sm text-slate-300">
                Recursos voltados para empresas, influencers e comunidades
                estão mapeados para as próximas iterações do produto.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Roadmap · Pós-MVP
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Modo Empresa */}
            <article className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/80 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/80">
                  <span>👔</span>
                  <span className="uppercase tracking-[0.16em]">
                    Modo Empresa
                  </span>
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
                <span className="rounded-full bg-slate-900/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Em breve
                </span>
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
                  Use a Copa como motor de engajamento para o seu canal:
                  bolões com{" "}
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
                <span className="rounded-full bg-slate-900/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Em breve
                </span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

/* === Componentes visuais de apoio (só UI) === */

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
