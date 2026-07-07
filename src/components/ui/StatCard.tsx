import Link from "next/link";

import { cn } from "@/lib/utils/cn";

const toneClasses = [
  "border-l-4 border-l-saffron bg-orange-50/40",
  "border-l-4 border-l-sky-500 bg-sky-50/60",
  "border-l-4 border-l-emerald-500 bg-emerald-50/60",
  "border-l-4 border-l-violet-500 bg-violet-50/60",
  "border-l-4 border-l-amber-500 bg-amber-50/60",
  "border-l-4 border-l-rose-500 bg-rose-50/60",
] as const;

type StatCardProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
  href?: string;
  tone?: number;
};

export function StatCard({ label, value, className, href, tone = 0 }: StatCardProps) {
  const displayValue = value ?? 0;
  const toneClass = toneClasses[((tone % toneClasses.length) + toneClasses.length) % toneClasses.length];
  const card = (
    <div
      className={cn(
        "flex h-full min-h-[112px] flex-col rounded-xl border border-border bg-surface-card p-4 shadow-sm",
        toneClass,
        href &&
          "transition hover:border-saffron/40 hover:bg-orange-50/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/30",
        className,
      )}
    >
      <p className="min-h-[2.5rem] text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-auto pt-2 text-2xl font-semibold tabular-nums text-slate-900">{displayValue}</p>
    </div>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block h-full rounded-xl no-underline">
      {card}
    </Link>
  );
}
