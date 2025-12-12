"use client";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-slate-950 px-4 text-slate-50">
      <h2 className="text-lg font-semibold">Algo deu errado</h2>
      <p className="mt-2 max-w-md text-center text-sm text-slate-300">
        Houve uma falha ao carregar esta pÇ­gina. Tente novamente ou volte para o
        dashboard.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
        >
          Tentar novamente
        </button>
        <a
          href="/dashboard"
          className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:border-emerald-400"
        >
          Voltar ao dashboard
        </a>
      </div>

      {error?.digest && (
        <p className="mt-4 text-[11px] text-slate-500">Erro: {error.digest}</p>
      )}
    </div>
  );
}
