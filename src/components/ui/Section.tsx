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
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
