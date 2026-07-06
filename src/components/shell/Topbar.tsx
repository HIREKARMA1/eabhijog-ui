"use client";

import Link from "next/link";

import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

type TopbarProps = {
  breadcrumb?: React.ReactNode;
  onMenuClick: () => void;
};

export function Topbar({ breadcrumb, onMenuClick }: TopbarProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface-card px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label={t("common", "nav.menu")}
          onClick={onMenuClick}
        >
          <Icon name="menu" size={20} />
        </Button>
        <div className="min-w-0 text-sm text-text-muted">{breadcrumb}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/profile"
          className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface sm:inline-block"
        >
          {t("common", "actions.profile")}
        </Link>
        <Link
          href="/logout"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface"
        >
          {t("common", "actions.logout")}
        </Link>
      </div>
    </header>
  );
}
