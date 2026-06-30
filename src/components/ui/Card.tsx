import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
};

export function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-surface-card p-4 shadow-sm md:p-5",
        className,
      )}
    >
      {title ? (
        <header className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-text-muted">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
