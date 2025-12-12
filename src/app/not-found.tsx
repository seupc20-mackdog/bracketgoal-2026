export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-xl shadow-slate-950/60">
        <h1 className="text-xl font-semibold">PÇ­gina nÇœo encontrada</h1>
        <p className="mt-2 text-sm text-slate-300">
          O recurso solicitado nÇœo existe ou pode ter sido movido. Verifique o link
          de convite ou retorne para o painel.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
          <a
            href="/"
            className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
          >
            Ir para a home
          </a>
          <a
            href="/dashboard"
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:border-emerald-400"
          >
            Abrir dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
