import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-white/90 px-5 py-5 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-saffron">Dashboard</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
