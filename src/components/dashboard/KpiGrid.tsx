"use client";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/context";

const toneClasses = [
  "border-l-saffron bg-orange-50/40",
  "border-l-sky-500 bg-sky-50/60",
  "border-l-emerald-500 bg-emerald-50/60",
  "border-l-violet-500 bg-violet-50/60",
  "border-l-amber-500 bg-amber-50/60",
  "border-l-rose-500 bg-rose-50/60",
] as const;

type KpiGridProps = {
  items: Array<{ labelKey: string; value: number | string | null | undefined }>;
};

export function KpiGrid({ items }: KpiGridProps) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <Card
          key={item.labelKey}
          className={toneClasses[index % toneClasses.length] + " flex h-full min-h-[112px] border-l-4 flex-col"}
        >
          <p className="min-h-[2.5rem] text-xs font-medium tracking-wide text-text-muted">
            {t("dashboard", item.labelKey)}
          </p>
          <p className="mt-auto pt-2 text-3xl font-bold tabular-nums text-slate-900">
            {item.value ?? 0}
          </p>
        </Card>
      ))}
    </div>
  );
}
