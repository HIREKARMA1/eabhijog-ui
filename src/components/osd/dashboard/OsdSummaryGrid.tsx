"use client";

import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/context";

type SummaryCard = {
  key: string;
  labelKey: string;
  fallbackKeys?: string[];
  /** Query string appended to /osd/{slug}/grievances */
  query: string;
};

const SUMMARY_CARDS: SummaryCard[] = [
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

function summaryValue(summary: Record<string, number>, card: SummaryCard) {
  if (summary[card.key] != null) return summary[card.key];
  for (const fallback of card.fallbackKeys ?? []) {
    if (summary[fallback] != null) return summary[fallback];
  }
  return 0;
}

function grievanceHref(basePath: string, query: string, extraParams?: Record<string, string>) {
  const params = new URLSearchParams(query);
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value && key !== "status" && key !== "page" && !params.has(key)) {
        params.set(key, value);
      }
    }
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function volumeCards(listMode: "active" | "disposed" | "reverted"): SummaryCard[] {
  const totalQuery =
    listMode === "disposed"
      ? "status=disposed_grievances"
      : listMode === "reverted"
        ? "status=reverted_grievances"
        : "";
  return [
    { key: "total", labelKey: "totalReceived", query: totalQuery },
    { key: "open", labelKey: "open", query: "status=open_volume" },
    { key: "resolved", labelKey: "resolved", query: "status=resolved" },
    { key: "closed_cases", labelKey: "closed", query: "status=closed" },
    { key: "rejected", labelKey: "rejected", query: "status=discarded" },
  ];
}

function OsdCardGrid({
  cards,
  summary,
  basePath,
  extraParams,
  columnsClassName,
}: {
  cards: SummaryCard[];
  summary: Record<string, number>;
  basePath: string;
  extraParams?: Record<string, string>;
  columnsClassName: string;
}) {
  const { t } = useI18n();

  return (
    <div className={columnsClassName}>
      {cards.map((card, index) => (
        <StatCard
          key={card.key}
          label={t("dashboard", `osdSummary.${card.labelKey}`)}
          value={summaryValue(summary, card)}
          href={grievanceHref(basePath, card.query, extraParams)}
          tone={index}
          compact
        />
      ))}
    </div>
  );
}

export function OsdVolumeGrid({
  summary,
  osdSlug,
  basePath,
  listMode = "active",
  extraParams,
}: {
  summary: Record<string, number>;
  osdSlug: string;
  basePath?: string;
  listMode?: "active" | "disposed" | "reverted";
  extraParams?: Record<string, string>;
}) {
  return (
    <OsdCardGrid
      cards={volumeCards(listMode)}
      summary={summary}
      basePath={basePath ?? `/osd/${osdSlug}/grievances`}
      extraParams={extraParams}
      columnsClassName="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
    />
  );
}

export function OsdSummaryGrid({
  summary,
  osdSlug,
}: {
  summary: Record<string, number>;
  osdSlug: string;
}) {
  return (
    <OsdCardGrid
      cards={SUMMARY_CARDS}
      summary={summary}
      basePath={`/osd/${osdSlug}/grievances`}
      columnsClassName="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
    />
  );
}
