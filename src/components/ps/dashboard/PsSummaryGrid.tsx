"use client";

import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/context";
import type { PsSummaryCards } from "@/types/api";

const SUMMARY_CARD_FILTERS: {
  key: keyof PsSummaryCards;
  labelKey: string;
  href: string;
}[] = [
  { key: "total_grievances", labelKey: "totalGrievances", href: "/ps/grievances" },
  { key: "new_today", labelKey: "newToday", href: "/ps/grievances?date_preset=today" },
  {
    key: "pending_review",
    labelKey: "pendingReview",
    href: "/ps/grievances?status=pending_review",
  },
  {
    key: "forwarded_to_department",
    labelKey: "forwardedToDepartment",
    href: "/ps/grievances?status=forwarded_to_department",
  },
  { key: "resolved", labelKey: "resolved", href: "/ps/grievances?status=resolved" },
];

export function PsSummaryGrid({ summary }: { summary: PsSummaryCards }) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {SUMMARY_CARD_FILTERS.map((card, index) => (
        <StatCard
          key={card.key}
          label={t("ps", `summary.${card.labelKey}`)}
          value={summary[card.key] ?? 0}
          href={card.href}
          tone={index}
        />
      ))}
    </div>
  );
}
