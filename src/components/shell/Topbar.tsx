"use client";

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
    <header className="z-30 flex min-h-14 items-center gap-3 border-b border-border bg-surface-card px-4 py-2 md:px-6 lg:sticky lg:top-[var(--portal-navbar-height)]">
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
    </header>
  );
}
