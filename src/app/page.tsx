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
    async function loadUser() {
      const { data } = await supabaseClient.auth.getUser();
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
      setLoadingAuth(false);
    }
    loadUser();
  }, []);

  const isLogged = !!userEmail;

  const handleLoginWithGoogle = async () => {
    setLoadingAuth(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
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
    <div className="relative min-h-[calc(100vh-3.5rem)] text-slate-50">
      {/* Fundo estilo estádio */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg/stadium-2026.jpg"
          alt="Estádio da Copa do Mundo 2026"
          fill
          priority
          className="object-cover hero-image"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-slate-950/90 to-black/95" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-12">
        {/* HERO */}
        <section className="grid items-center gap-10 md:grid-cols-[1.6fr,1.2fr]">
          <div className="space-y-6">
            {/* Marca */}
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
                  Bracket<span className="text-amber-300">Goal</span> 2026
                </span>
                <span className="text-[11px] text-slate-300">
                  Bolões recreativos para empresas, streamers e grupos de
                  amigos.
                </span>
              </div>
            </div>

            {/* Título + subtítulo otimizados */}
            <div>
              <h1 className="hero-title mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                Bolões Personalizados para Empresas, Streamers e Amigos
              </h1>
              <p className="hero-subtitle mt-3 max-w-xl text-base leading-relaxed text-slate-200/90 md:text-lg">
                Crie competições esportivas em minutos, personalize regras e
                compartilhe com sua equipe, comunidade ou grupo de amigos.
              </p>
            </div>

            {/* CTA principal */}
            <div
              id="cta"
              className="hero-buttons mt-4 flex flex-col items-stretch gap-3 sm:items-start"
            >
              {isLogged ? (
                <>
                  <button
                    onClick={handleGoToDashboard}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Acessar meus bolões da Copa
                  </button>
                  <span className="text-xs text-emerald-100/90">
                    Logado como{" "}
                    <span className="font-semibold">{userEmail}</span>
                  </span>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoginWithGoogle}
                    disabled={loadingAuth}
                    className="btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingAuth
                      ? "Verificando sessão..."
                      : "Criar Meu Bolão (Grátis)"}
                  </button>

                  <button
                    onClick={handleGoToEmailAuth}
                    className="text-xs text-slate-100 underline underline-offset-4 hover:text-emerald-200"
                  >
                    Prefiro entrar com e-mail e senha
                  </button>
                </>
              )}
            </div>

            {/* Aviso legal */}
            <p className="mt-3 max-w-md text-[11px] text-slate-400">
              BracketGoal é uma plataforma de bolões{" "}
              <span className="font-semibold">estritamente recreativos</span>.
              Não opera como casa de apostas ou cassino. Cada organizador define
              regras e premiações do seu próprio bolão.
            </p>
          </div>

          {/* Card torneio base à direita */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-700/80 bg-gradient-to-br from-emerald-900/90 via-emerald-950 to-slate-950 p-4 shadow-xl shadow-emerald-900/40">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200">
                    Torneio base
                  </p>
                  <h2 className="text-sm font-semibold">
                    {copa2026.name} · {copa2026.year}
                  </h2>
                </div>
                <span className="rounded-full border border-amber-300/60 bg-black/25 px-2 py-0.5 text-[11px] text-amber-200">
                  Fase de grupos + mata-mata
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-emerald-50/90">
                {copa2026.description}
              </p>
              <ul className="list-inside list-disc space-y-1 text-[11px] text-emerald-50/90">
                <li>Calendário completo da Copa já configurado.</li>
                <li>Chaveamento gerado a partir dos palpites.</li>
                <li>Pontuação ajustável por tipo de bolão.</li>
                <li>Ranking em tempo real por organizador.</li>
              </ul>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/85 p-3">
                <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950">
                    👔
                  </span>
                  Para empresas
                </p>
                <p className="text-slate-200/90">
                  Engaje colaboradores com um bolão interno e ranking por área
                  ou filial.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/85 p-3">
                <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950">
                    📺
                  </span>
                  Para streamers
                </p>
                <p className="text-slate-200/90">
                  Crie um bolão para inscritos e apoiadores, com URL própria e
                  ranking da comunidade.
                </p>
              </div>
              <div className="sm:col-span-2 rounded-xl border border-slate-800 bg-slate-950/85 p-3">
                <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950">
                    🎉
                  </span>
                  Entre amigos
                </p>
                <p className="text-slate-200/90">
                  Organize o clássico bolão com família e amigos, sem planilhas
                  e sem perder nenhum palpite.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="mt-12 space-y-5">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Como funciona o{" "}
              <span className="text-emerald-300">BracketGoal</span>
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              Três passos simples para o seu bolão da Copa 2026 sair do papel.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              step="1"
              title="Crie seu bolão"
              description="Defina nome, público (empresa, audiência ou amigos) e regras básicas de pontuação."
            />
            <FeatureCard
              step="2"
              title="Convide a galera"
              description="Compartilhe o link do bolão por e-mail, WhatsApp, live ou canal privado."
            />
            <FeatureCard
              step="3"
              title="Acompanhe o ranking"
              description="Veja quem está mandando melhor nos palpites, grupo a grupo, até a final."
            />
          </div>
        </section>

        {/* FAQ rápido */}
        <section className="mt-12 space-y-5">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Perguntas rápidas
            </h2>
            <p className="text-sm text-slate-300">
              Alguns pontos importantes antes de você criar seu primeiro bolão.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <FaqItem question="É realmente gratuito?">
              Estamos em fase de MVP. O uso é gratuito para criar e testar
              bolões recreativos da Copa 2026. No futuro, planos premium podem
              oferecer recursos extras para empresas e criadores.
            </FaqItem>
            <FaqItem question="Preciso instalar algum aplicativo?">
              Não. O BracketGoal roda direto no navegador (desktop e mobile).
              Basta acessar o site, entrar com sua conta e criar seu bolão.
            </FaqItem>
            <FaqItem question="Posso personalizar as regras do meu bolão?">
              O MVP já nasce preparado para diferentes lógicas de pontuação. A
              ideia é evoluir para permitir configurações mais avançadas por
              organizador.
            </FaqItem>
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
      <p className="mt-1 text-[12px] leading-relaxed text-slate-300">
        {description}</p>
    </article>
  );
}

type FaqItemProps = {
  question: string;
  children: ReactNode;
};

function FaqItem({ question, children }: FaqItemProps) {
  return (
    <details className="group rounded-xl border border-slate-800 bg-slate-950/80 p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-slate-100">
        <span>{question}</span>
        <span className="text-xs text-slate-400 group-open:hidden">+</span>
        <span className="hidden text-xs text-slate-400 group-open:inline">
          –
        </span>
      </summary>
      <p className="mt-2 text-[13px] text-slate-300">{children}</p>
    </details>
  );
}
