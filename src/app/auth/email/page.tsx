// src/app/auth/email/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabaseClient";

type Mode = "login" | "signup";

export default function EmailAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setMsg(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          setMsg(
            "Conta criada! Verifique seu e-mail (se a confirmação estiver ativada) ou tente entrar com seu e-mail e senha."
          );
          setMode("login");
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          router.replace("/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-slate-950 via-slate-950 to-black">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/")}
          className="mb-4 text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          <span>←</span>
          <span>Voltar para a página inicial</span>
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl shadow-black/60 backdrop-blur-sm p-6 sm:p-7 space-y-4">
          {/* Branding BracketGoal */}
          <div className="flex flex-col items-center text-center mb-3">
            <div className="relative w-12 h-12 mb-2 rounded-2xl overflow-hidden border border-emerald-900 bg-slate-950">
              <Image
                src="/brand/bracketgoal-icon-512.png"
                alt="BracketGoal"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              Bracket<span className="text-amber-300">Goal</span>
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xs">
              Autenticação por e-mail e senha. Ideal para quem prefere não usar
              Google ou quer separar o acesso aos bolões recreativos.
            </p>
          </div>

          {/* Título do modo atual */}
          <div className="flex mb-2 text-xs rounded-full bg-slate-900/70 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMsg(null);
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-full font-medium transition-colors ${
                mode === "login"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMsg(null);
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-full font-medium transition-colors ${
                mode === "signup"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              Criar conta
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            {mode === "login"
              ? "Use seu e-mail e senha cadastrados para entrar no BracketGoal. Se preferir, também é possível entrar com Google pela página inicial."
              : "Crie uma conta com e-mail e senha para acessar seus brackets da Copa 2026. Dependendo da configuração, o Supabase pode exigir confirmação por e-mail."}
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3 mt-1">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1">
              <label
                className="text-[11px] text-slate-300"
                htmlFor="password"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400"
              />
            </div>

            {error && (
              <p className="text-[11px] text-red-300 bg-red-950/40 border border-red-900/60 rounded px-2 py-1">
                {error}
              </p>
            )}

            {msg && (
              <p className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-900/60 rounded px-2 py-1">
                {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold text-slate-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processando..."
                : mode === "login"
                ? "Entrar"
                : "Criar conta"}
            </button>
          </form>

          <button
            onClick={toggleMode}
            className="text-[11px] text-slate-300 hover:text-slate-100"
          >
            {mode === "login"
              ? "Ainda não tem conta? Criar agora"
              : "Já tem conta? Entrar com e-mail"}
          </button>

          <p className="text-[10px] text-slate-500 text-center">
            A autenticação é gerenciada pelo Supabase. Você decide nas
            configurações se quer exigir confirmação por e-mail. BracketGoal é
            um serviço de bolões recreativos, não é cassino nem casa de apostas.
          </p>
        </div>
      </div>
    </div>
  );
}
