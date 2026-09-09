"use client";

import type { ReactNode } from "react";

type TopbarProps = {
  title?: string;
  breadcrumb?: ReactNode;
  /** Kept for PortalShell compatibility; menu opens from GovtNavbar on mobile. */
  onMenuClick?: () => void;
};

export function Topbar({ title, breadcrumb }: TopbarProps) {
  return (
    <header className="z-30 flex min-h-12 shrink-0 items-center gap-3 border-b border-border bg-surface-card px-3 py-2 sm:min-h-14 md:px-6 md:py-2.5">
      <div className="min-w-0 truncate text-sm font-semibold text-slate-900 sm:text-base">
        {title ? <strong>{title}</strong> : null}
        {title && breadcrumb ? (
          <span className="font-normal text-text-muted">{" / "}</span>
        ) : null}
        {breadcrumb}
      </div>
    </header>
  );
}
