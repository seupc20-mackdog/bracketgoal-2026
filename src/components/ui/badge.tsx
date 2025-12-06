// src/components/ui/badge.tsx
import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "neutral" | "success" | "outline";
  className?: string;
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium";
  const styleMap: Record<NonNullable<BadgeProps["variant"]>, string> = {
    neutral: "bg-slate-800 text-slate-100",
    success:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40",
    outline: "border border-slate-600 text-slate-100",
  };

  return (
    <span className={`${base} ${styleMap[variant]} ${className}`}>
      {children}
    </span>
  );
}
