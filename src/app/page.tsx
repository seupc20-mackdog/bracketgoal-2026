"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabaseClient";
import { copa2026 } from "@/data/tournaments";

export default function Home() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setLoadingAuth(false);
    });
  }, []);

  const isLogged = !!userEmail;

  const handleLoginWithGoogle = async () => {
    setLoadingAuth(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/dashboard` },
    });
  };

  const goDashboard = () => router.push("/dashboard");
  const goEmailAuth = () => router.push("/auth/email");

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] text-slate-50">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg/stadium-2026.jpg"
          alt="Fundo do estádio"
          fill
          priority
          className="object-cover hero-image"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-slate-950/92 to-black/95" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-12">
        <section className="grid items-center gap-10 md:grid-cols-[1.5fr,1.1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-emerald-900 bg-slate-950">
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
                  Bolões recreativos com ranking automático.
                </span>
              </div>
            </div>

            <div>
              <h1 className="hero-title mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                Crie um bolão em minutos e convide pelo WhatsApp.
              </h1>
              <p className="hero-subtitle mt-3 max-w-xl text-base leading-relaxed text-slate-200/90 md:text-lg">
                Escolha os jogos, compartilhe o link e veja o ranking pronto.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200/90">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  Crie: nome, jogos e regras simples.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  Compartilhe o link no WhatsApp.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  Acompanhe ranking e palpites.
                </li>
              </ul>
            </div>

            <div className="hero-buttons mt-2 flex flex-col items-stretch gap-3 sm:items-start">
              {isLogged ? (
                <>
                  <button onClick={goDashboard} className="btn-primary w-full sm:w-auto">
                    Ir para meu painel
                  </button>
                  <span className="text-xs text-emerald-100/90">
                    Logado como <span className="font-semibold">{userEmail}</span>
                  </span>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoginWithGoogle}
                    disabled={loadingAuth}
                    className="btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingAuth ? "Verificando sessão..." : "Entrar para criar bolão"}
                  </button>

                  <button
                    onClick={goEmailAuth}
                    className="text-xs text-slate-100 underline underline-offset-4 hover:text-emerald-200"
                  >
                    Entrar com e-mail e senha
                  </button>
                </>
              )}
              <p className="text-[11px] text-slate-400">
                Recreativo: não é casa de apostas. Prêmios são combinados entre participantes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-700/80 bg-gradient-to-br from-emerald-900/90 via-emerald-950 to-slate-950 p-4 shadow-xl shadow-emerald-900/40">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200">
                    Destaque do momento
                  </p>
                  <h2 className="text-sm font-semibold">
                    {copa2026.name} ({copa2026.year})
                  </h2>
                </div>
                <span className="rounded-full border border-amber-300/60 bg-black/25 px-2 py-0.5 text-[11px] text-amber-200">
                  Modelo pronto
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-emerald-50/90">
                Use o modelo da Copa 2026 para lançar um bolão em um clique, com calendário configurado.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-50/90">
                <span className="rounded-full bg-emerald-800/60 px-2 py-0.5">
                  Fase de grupos + mata-mata
                </span>
                <span className="rounded-full bg-emerald-800/60 px-2 py-0.5">
                  Ranking automático
                </span>
              </div>
              <button
                onClick={goDashboard}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-100 transition hover:bg-emerald-800/60"
              >
                Ver modelo
              </button>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <AudienceCard
                title="Para empresas"
                icon="🏢"
                copy="Engaje o time com ranking por área ou filial, sem planilhas."
              />
              <AudienceCard
                title="Para streamers"
                icon="🎥"
                copy="Bolão para inscritos com link único e ranking da comunidade."
              />
              <AudienceCard
                title="Entre amigos"
                icon="🎉"
                copy="Organize o bolão da turma em minutos, centralizando palpites."
                full
              />
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-5">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">Como funciona</h2>
            <p className="max-w-2xl text-sm text-slate-300">
              Três passos rápidos para qualquer campeonato.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              step="1"
              title="Crie"
              description="Nome, regras simples e jogos."
            />
            <FeatureCard
              step="2"
              title="Compartilhe"
              description="Envie o link pelo WhatsApp."
            />
            <FeatureCard
              step="3"
              title="Acompanhe"
              description="Ranking e palpites em tempo real."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

type FeatureCardProps = {
  step: string;
  title: string;
  description: string;
};

function FeatureCard({ step, title, description }: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-slate-950">
          {step}
        </span>
        Passo {step}
      </div>
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-300">{description}</p>
    </article>
  );
}

type AudienceCardProps = {
  title: string;
  icon: string;
  copy: string;
  full?: boolean;
};

function AudienceCard({ title, icon, copy, full }: AudienceCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/85 p-3 ${full ? "sm:col-span-2" : ""}`}
    >
      <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950">
          {icon}
        </span>
        {title}
      </p>
      <p className="text-slate-200/90">{copy}</p>
    </div>
  );
}
