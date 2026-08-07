import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SectionProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function Section({ title, children, action, className }: SectionProps) {
  return (
    <section className={cn("space-y-3 sm:space-y-4", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0 space-y-1">
          <div className="h-1.5 w-10 rounded-full bg-saffron/80" />
          <h2 className="break-words text-xs font-semibold uppercase tracking-[0.18em] text-text-muted sm:tracking-[0.22em]">
            {title}
          </h2>
        </div>
        {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
