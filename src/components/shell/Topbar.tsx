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
    <header className="z-30 flex min-h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-card px-4 py-2.5 md:px-6">
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
      <div className="min-w-0 text-base font-semibold text-slate-900">{breadcrumb}</div>
    </header>
  );
}
