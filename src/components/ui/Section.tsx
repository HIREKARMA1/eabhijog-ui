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
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="h-1.5 w-10 rounded-full bg-saffron/80" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
