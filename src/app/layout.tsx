// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import Image from "next/image";
import "./globals.css";
import HeaderActions from "@/components/HeaderActions";

const themeColor = "#064E3B";

export const metadata: Metadata = {
  title: "BracketGoal - bolões recreativos com ranking",
  description:
    "BracketGoal é uma plataforma para criar bolões recreativos com convites por link, ranking automático e regras simples.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <header className="border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-emerald-900/60 bg-slate-950">
                <Image
                  src="/brand/bracketgoal-icon-512.png"
                  alt="BracketGoal"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight">
                  Bracket<span className="text-amber-300">Goal</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Bolões recreativos com ranking e convites por link.
                </span>
              </div>
            </div>

            <HeaderActions />
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>

        <footer className="border-t border-slate-900 bg-slate-950/95">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-[11px] text-slate-500 sm:flex-row">
            <span>
              © {new Date().getFullYear()} BracketGoal. Recreational pools only
              — not a betting/casino platform.
            </span>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
              <a href="/terms" className="hover:text-emerald-300">
                Terms &amp; Conditions
              </a>
              <a href="/privacy" className="hover:text-emerald-300">
                Privacy Policy
              </a>
              <a
                href="mailto:contato@bracketgoal.app"
                className="hover:text-emerald-300"
              >
                Contato
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
