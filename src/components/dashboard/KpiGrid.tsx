"use client";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/context";

type KpiGridProps = {
  items: Array<{ labelKey: string; value: number | string }>;
};

export function KpiGrid({ items }: KpiGridProps) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.labelKey}>
          <p className="text-xs font-medium tracking-wide text-text-muted">
            {t("dashboard", item.labelKey)}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
