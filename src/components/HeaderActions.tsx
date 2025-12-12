"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";

export default function HeaderActions() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setLoading(false);
    });
  }, []);

  const primaryLabel = userId ? "Meu painel" : "Entrar";
  const primaryHref = userId ? "/dashboard" : "/auth/email";

  return (
    <nav className="flex items-center gap-3 text-xs text-slate-300 sm:gap-4 sm:text-sm">
      <Link
        href={primaryHref}
        className="btn-primary px-4 py-2 text-[11px] font-semibold sm:text-[13px]"
      >
        {loading ? "..." : primaryLabel}
      </Link>
      <Link
        href="/about"
        className="hidden sm:inline transition-colors hover:text-emerald-300"
      >
        Sobre o bolão
      </Link>
    </nav>
  );
}
