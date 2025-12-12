export function buildShareUrl(
  poolId: string,
  appUrl?: string | null,
  origin?: string | null
): string {
  const base = (appUrl ?? "").trim() || (origin ?? "").trim();
  const cleanBase = base.replace(/\/+$/, "");

  if (!cleanBase) {
    return `/pools/${poolId}/join`;
  }

  return `${cleanBase}/pools/${poolId}/join`;
}

export function toE164BR(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return null;

  // Já vem com DDI BR
  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith("55")
  ) {
    return `+${digits}`;
  }

  // Remove DDI duplicado, caso venha 55 + número completo
  const withoutCountry =
    digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;

  if (withoutCountry.length === 10 || withoutCountry.length === 11) {
    return `+55${withoutCountry}`;
  }

  return null;
}

export function buildInviteMessage(
  poolName: string,
  shareUrl: string,
  customName?: string
): string {
  const safeName = poolName || "bolÇœo";
  const base = `Convite para o bolÇœo "${safeName}" no BracketGoal.\nEntre pelo link: ${shareUrl}`;
  return customName ? `${base}\nNome sugerido para vocÇ¦: ${customName}` : base;
}
