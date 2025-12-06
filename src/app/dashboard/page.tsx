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

  return (
    <div className="min-h-screen relative text-slate-50">
      {/* Fundo sutil em degradê para ficar coerente com a página de palpites */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-black" />

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Topo do painel */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-900/50 border border-emerald-600/60 text-[11px] font-medium text-emerald-200 uppercase tracking-[0.16em]">
              BracketGoal Dashboard
            </span>
            <h1 className="mt-3 text-2xl md:text-3xl font-semibold">
              Meu painel
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Acompanhe seus bolões, crie experiências para empresas ou
              comunidades e veja o desempenho dos participantes em tempo real.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <p className="text-xs text-slate-400">
              Logado como{" "}
              <span className="font-medium text-slate-100">
                {loadingUser ? "carregando..." : userEmail ?? "usuário anônimo"}
              </span>
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-800/70 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Hero principal: Copa do Mundo 2026 */}
        <section className="mb-8 grid gap-6 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.5fr)]">
          <div className="rounded-2xl border border-emerald-700/70 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 shadow-xl shadow-emerald-900/40 p-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-black/25 border border-amber-300/40 text-[11px] text-amber-200 font-medium mb-3">
                ⚽ World Cup 2026 Pool
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">
                Bolão oficial da Copa do Mundo 2026
              </h2>
              <p className="text-sm text-emerald-50/90 max-w-xl">
                Use o BracketGoal para montar todo o chaveamento da Copa:
                fase de grupos, mata-mata, critérios de desempate e ranking em
                tempo real. Este é o torneio base que alimenta todos os
                bolões da plataforma.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/tournaments/world-cup-2026/palpites"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-sm font-semibold shadow-lg shadow-amber-500/30 hover:bg-amber-300 transition-colors"
              >
                Ir para meus palpites
              </Link>
              <span className="text-[11px] text-emerald-100/80">
                Seu desempenho neste torneio será usado como base para
                rankings de empresas e influenciadores.
              </span>
            </div>
          </div>

          {/* Bloco lateral: visão geral rápida */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Status da Copa 2026
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                Grupos definidos, aguardando repescagem. Em breve você poderá
                acompanhar o avanço do seu bracket em tempo real.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center justify-between">
                <span>Fase de grupos</span>
                <span className="text-emerald-300 font-medium">
                  Palpites em andamento
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Mata-mata</span>
                <span className="text-slate-500">Disponível em breve</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Ranking global</span>
                <span className="text-slate-500">MVP em construção</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Cards de modos de uso */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Modo Empresa */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/85 p-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 mb-3">
                👔 Modo Empresa
              </div>
              <h3 className="text-lg font-semibold mb-1">
                Bolão corporativo para times internos
              </h3>
              <p className="text-sm text-slate-300 mb-3">
                Em breve você poderá criar um bolão com logotipo da empresa,
                regras próprias, prêmios internos e ranking apenas para
                colaboradores.
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Recursos planejados para o pós-MVP.</span>
              <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                Em breve
              </span>
            </div>
          </div>

          {/* Modo Influenciador */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/85 p-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 mb-3">
                📺 Modo Influencer / Streamer
              </div>
              <h3 className="text-lg font-semibold mb-1">
                Bolões para inscritos e comunidade
              </h3>
              <p className="text-sm text-slate-300 mb-3">
                Crie um bracket exclusivo para sua audiência, com URL
                personalizada, identidade visual do canal e ranking só da
                comunidade.
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Integração com Twitch, YouTube e Discord no roadmap.</span>
              <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                Em breve
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
