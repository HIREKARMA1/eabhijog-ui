"use client";

type TopbarProps = {
  breadcrumb?: React.ReactNode;
  /** Kept for PortalShell compatibility; menu opens from GovtNavbar on mobile. */
  onMenuClick?: () => void;
};

export function Topbar({ breadcrumb }: TopbarProps) {
  return (
    <header className="z-30 flex min-h-12 shrink-0 items-center gap-3 border-b border-border bg-surface-card px-3 py-2 sm:min-h-14 md:px-6 md:py-2.5">
      <div className="min-w-0 truncate text-sm font-semibold text-slate-900 sm:text-base">
        {breadcrumb}
      </div>
    </header>
  );
}
