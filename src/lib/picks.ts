export type PoolPhase =
  | "aguardando_palpite"
  | "palpites_encerrados"
  | "em_andamento"
  | "finalizado";

type PoolTiming = {
  status?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
};

type MatchTiming = {
  starts_at?: string | null;
  start_at?: string | null;
  status?: string | null;
};

export function derivePoolPhase(pool?: PoolTiming | null): PoolPhase {
  if (!pool) return "aguardando_palpite";
  const now = Date.now();
  const starts = pool.starts_at ? Date.parse(pool.starts_at) : null;
  const ends = pool.ends_at ? Date.parse(pool.ends_at) : null;
  const status = (pool.status || "").toLowerCase();

  if (status === "finished" || status === "cancelled") return "finalizado";
  if (ends && now >= ends) return "finalizado";
  if (starts && now >= starts) return "em_andamento";
  if (status === "active") return "aguardando_palpite";
  return "palpites_encerrados";
}

export function isMatchLocked(
  match: MatchTiming | undefined,
  phase: PoolPhase
): boolean {
  if (phase === "palpites_encerrados" || phase === "finalizado") return true;
  const startIso = match?.starts_at || match?.start_at;
  if (!startIso) return false;
  const now = Date.now();
  const start = Date.parse(startIso);
  if (Number.isNaN(start)) return false;
  if (now >= start) return true;
  const status = (match?.status || "").toLowerCase();
  return status === "live" || status === "in_progress";
}

export function formatCountdown(target?: string | null): string | null {
  if (!target) return null;
  const ms = Date.parse(target) - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms <= 0) return "encerrou";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}
