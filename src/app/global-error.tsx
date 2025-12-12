"use client";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-xl shadow-slate-950/60">
          <h1 className="text-xl font-semibold">Oops! Algo saiu do ar.</h1>
          <p className="mt-2 text-sm text-slate-300">
            Detectamos um erro inesperado. Tente recarregar ou volte para a tela
            inicial enquanto estabilizamos.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
            >
              Recarregar página
            </button>
            <a
              href="/"
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:border-emerald-400"
            >
              Ir para a home
            </a>
          </div>

          {error?.digest && (
            <p className="mt-3 text-[11px] text-slate-500">
              Diagnóstico: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
