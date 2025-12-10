"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado pelo GlobalError:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-slate-950 text-slate-50 px-4">
      <h2 className="text-lg font-semibold">Algo deu errado no BracketGoal.</h2>
      <p className="mt-2 max-w-md text-center text-sm text-slate-300">
        Isso pode ter sido causado por uma falha temporária na API ou por uma
        atualização de código. Você pode tentar novamente ou voltar ao painel.
      </p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => reset()}
          className="btn-primary"
        >
          Tentar novamente
        </button>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:border-emerald-400"
        >
          Voltar ao dashboard
        </button>
      </div>
    </div>
  );
}
