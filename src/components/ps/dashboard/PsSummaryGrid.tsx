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
    key: "under_osd_review",
    labelKey: "underOsdReview",
    href: "/ps/grievances?status=under_osd_review",
  },
  {
    key: "forwarded_to_department",
    labelKey: "forwardedToDepartment",
    href: "/ps/grievances?status=forwarded_to_department",
  },
  {
    key: "waiting_for_department_response",
    labelKey: "waitingForDepartment",
    href: "/ps/grievances?status=waiting_for_department_response",
  },
  { key: "resolved", labelKey: "resolved", href: "/ps/grievances?status=resolved" },
  { key: "closed", labelKey: "closed", href: "/ps/grievances?status=closed" },
  {
    key: "high_priority",
    labelKey: "highPriority",
    href: "/ps/grievances?priority=high_priority",
  },
  { key: "overdue_cases", labelKey: "overdueCases", href: "/ps/grievances?overdue=true" },
];

export function PsSummaryGrid({ summary }: { summary: PsSummaryCards }) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {SUMMARY_CARD_FILTERS.map((card) => (
        <StatCard
          key={card.key}
          label={t("ps", `summary.${card.labelKey}`)}
          value={summary[card.key]}
          href={card.href}
        />
      ))}
    </div>
  );
}
