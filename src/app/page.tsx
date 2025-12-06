// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabaseClient";
import { copa2026 } from "@/data/tournaments";

export default function HomePage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabaseClient.auth.getUser();
      if (data.user) {
        setUserEmail(data.user.email ?? null);
      }
      setLoadingAuth(false);
    };
    getSession();
  }, []);

  const handleLoginGoogle = async () => {
    setLoadingAuth(true);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/dashboard`,
      },
    });
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoToEmailAuth = () => {
    router.push("/auth/email");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] relative text-slate-50">
      {/* Fundo estilo estádio + overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg/stadium-2026.jpg"
          alt="Estádio da Copa do Mundo 2026"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-slate-950/92 to-black/95" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-12">
        {/* HERO: logo + texto + CTA */}
        <section className="grid gap-8 md:grid-cols-[1.6fr,1.2fr] items-center">
          {/* Lado esquerdo */}
          <div className="space-y-6">
            {/* Logo grande */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-emerald-900 bg-slate-950">
                <Image
                  src="/brand/bracketgoal-icon-512.png"
                  alt="BracketGoal"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-semibold tracking-tight">
                  Bracket<span className="text-amber-300">Goal</span>
                </span>
                <span className="text-[11px] text-slate-300">
                  Plataforma de bolões recreativos · World Cup 2026
                </span>
              </div>
            </div>

            <div>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight drop-shadow-[0_0_18px_rgba(0,0,0,0.6)]">
                Bolões de campeonato em nível profissional,
                <br className="hidden sm:block" /> começando pela{" "}
                <span className="bg-gradient-to-tr from-amber-300 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  Copa do Mundo 2026
                </span>
                .
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-200/90 leading-relaxed max-w-xl">
                O BracketGoal permite que{" "}
                <span className="font-semibold">
                  empresas, influenciadores e grupos de amigos
                </span>{" "}
                rodem bolões totalmente recreativos, com ranking, regras
                próprias e uma experiência visual digna de transmissão oficial.
              </p>
            </div>

            {/* Bullets de valor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200/90">
              <div className="space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                    1
                  </span>
                  <span className="font-semibold">
                    Torneio base da Copa 2026
                  </span>
                </p>
                <p className="text-slate-300">
                  Fase de grupos, mata-mata e chaveamento automáticos a partir
                  dos seus palpites.
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                    2
                  </span>
                  <span className="font-semibold">
                    Múltiplos bolões no mesmo motor
                  </span>
                </p>
                <p className="text-slate-300">
                  Um único torneio alimenta bolões corporativos, de streamers
                  e grupos privados.
                </p>
              </div>
            </div>

            {/* CTA: login / dashboard */}
            <div className="mt-4 flex flex-col gap-3 items-start">
              {userEmail ? (
                <>
                  <button
                    onClick={handleGoToDashboard}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-sm font-semibold shadow-lg shadow-amber-400/30 hover:bg-amber-300 transition-colors"
                  >
                    Ir para meu painel
                  </button>
                  <span className="text-xs text-emerald-100/90">
                    Logado como{" "}
                    <span className="font-semibold">{userEmail}</span>
                  </span>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoginGoogle}
                    disabled={loadingAuth}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingAuth
                      ? "Verificando sessão..."
                      : "Entrar com Google"}
                  </button>

                  <button
                    onClick={handleGoToEmailAuth}
                    className="text-xs text-slate-100 underline underline-offset-4 hover:text-emerald-200"
                  >
                    Ou entrar com e-mail e senha
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 max-w-md mt-3">
              BracketGoal é uma plataforma de bolões{" "}
              <span className="font-semibold">estritamente recreativos</span>.
              Não vende bilhetes diretamente ao público e não opera como casa
              de apostas ou cassino. Cada organizador define suas próprias
              regras e premiações em conformidade com a legislação local.
            </p>
          </div>

          {/* Lado direito: card do torneio base + “para quem é” */}
          <div className="space-y-4">
            {/* Card do torneio base */}
            <div className="rounded-2xl border border-emerald-700/80 bg-gradient-to-br from-emerald-900/90 via-emerald-950 to-slate-950 p-4 shadow-xl shadow-emerald-900/40">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">
                  Torneio base: {copa2026.name}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/25 border border-amber-300/50 text-amber-200">
                  {copa2026.year}
                </span>
              </div>
              <p className="text-xs text-emerald-50/90 leading-relaxed mb-3">
                {copa2026.description}
              </p>
              <ul className="text-[11px] text-emerald-50/90 list-disc list-inside space-y-1">
                <li>Fase de grupos completa com todos os confrontos.</li>
                <li>Chaveamento de mata-mata gerado a partir dos seus palpites.</li>
                <li>Pontuação configurável para diferentes tipos de bolão.</li>
                <li>Ranking em tempo real por organizador.</li>
              </ul>
            </div>

            {/* Mini cards: para quem é o BracketGoal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/85 p-3">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px]">
                    👔
                  </span>
                  Para empresas
                </p>
                <p className="text-slate-200/90">
                  Engaje colaboradores com um bolão interno, logotipo da
                  empresa, ranking só da equipe e regras próprias de premiação.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/85 p-3">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px]">
                    📺
                  </span>
                  Para influenciadores
                </p>
                <p className="text-slate-200/90">
                  Crie um bolão exclusivo para inscritos, com URL
                  personalizada, campanhas promocionais e ranking da comunidade.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/85 p-3 sm:col-span-2">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px]">
                    🎉
                  </span>
                  Entre amigos e ligas recreativas
                </p>
                <p className="text-slate-200/90">
                  Organize aquele bolão clássico com amigos, família ou grupo
                  de futebol, com uma interface moderna e tudo centralizado em
                  um só lugar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seção extra curta (credibilidade / compliance) */}
        <section className="mt-10 border-t border-slate-800/80 pt-5">
          <div className="grid gap-4 md:grid-cols-3 text-[11px] text-slate-300">
            <div>
              <h3 className="text-xs font-semibold mb-1 text-slate-100">
                Plataforma recreativa
              </h3>
              <p>
                O foco do BracketGoal é diversão, engajamento e experiência de
                torneio. Não há cassino, roleta, slot ou mercados de odds em
                tempo real.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold mb-1 text-slate-100">
                Cada organizador, um bolão
              </h3>
              <p>
                Empresas, influencers ou amigos definem regras e prêmios do
                próprio bolão, sempre em caráter recreativo, sem promessa de
                lucro financeiro garantido.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold mb-1 text-slate-100">
                Tecnologia moderna
              </h3>
              <p>
                Construído em Next.js com Supabase, preparado para escalar com
                segurança, autenticação moderna e expansão para outros
                campeonatos além da Copa 2026.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
