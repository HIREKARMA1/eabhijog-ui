import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  className?: string;
  href?: string;
};

export function StatCard({ label, value, className, href }: StatCardProps) {
  const card = (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-card p-4 shadow-sm",
        href &&
          "transition hover:border-saffron/40 hover:bg-orange-50/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/30",
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block rounded-xl no-underline">
      {card}
    </Link>
  );
}
