"use client";

import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/context";

const SUMMARY_CARDS: {
  key: string;
  labelKey: string;
  fallbackKeys?: string[];
  /** Query string appended to /osd/{slug}/grievances */
  query: string;
}[] = [
  { key: "assigned_today", labelKey: "assignedToday", query: "date_preset=today" },
  {
    key: "pending_acknowledgement",
    labelKey: "pendingAck",
    fallbackKeys: ["pending"],
    query: "status=pending_acknowledgement",
  },
  {
    key: "waiting_for_department",
    labelKey: "waitingDept",
    fallbackKeys: ["action_pending"],
    query: "status=waiting_for_department",
  },
  {
    key: "department_responded",
    labelKey: "deptResponded",
    query: "status=department_responded",
  },
  {
    key: "citizen_waiting",
    labelKey: "citizenWaiting",
    query: "status=citizen_waiting",
  },
  {
    key: "resolved_today",
    labelKey: "resolvedToday",
    query: "status=resolved&date_preset=today",
  },
  { key: "overdue_cases", labelKey: "overdue", query: "overdue=true" },
];

function summaryValue(summary: Record<string, number>, card: (typeof SUMMARY_CARDS)[number]) {
  if (summary[card.key] != null) return summary[card.key];
  for (const fallback of card.fallbackKeys ?? []) {
    if (summary[fallback] != null) return summary[fallback];
  }
  return 0;
}

export function OsdSummaryGrid({
  summary,
  osdSlug,
}: {
  summary: Record<string, number>;
  osdSlug: string;
}) {
  const { t } = useI18n();
  const basePath = `/osd/${osdSlug}/grievances`;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {SUMMARY_CARDS.map((card, index) => (
        <StatCard
          key={card.key}
          label={t("dashboard", `osdSummary.${card.labelKey}`)}
          value={summaryValue(summary, card)}
          href={`${basePath}?${card.query}`}
          tone={index}
          compact
        />
      ))}
    </div>
  );
}
