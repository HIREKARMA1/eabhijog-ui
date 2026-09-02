"use client";

import { MisBarChart, MisPieChart, MisTrendChart } from "@/components/ps/MisCharts";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/context";
import type { PsMisAnalyticsData } from "@/types/api";

const CARD_DEFS: Array<{
  key: keyof PsMisAnalyticsData["summary"];
  labelKey: string;
  href: string;
}> = [
  { key: "total_grievances", labelKey: "totalGrievances", href: "/ps/grievances" },
  { key: "new_today", labelKey: "newToday", href: "/ps/grievances?date_preset=today" },
  { key: "pending", labelKey: "pending", href: "/ps/grievances?status=pending" },
  { key: "disposed", labelKey: "disposed", href: "/ps/disposed-grievances" },
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
  { key: "resolved", labelKey: "resolved", href: "/ps/disposed-grievances?status=resolved" },
  { key: "closed", labelKey: "closed", href: "/ps/disposed-grievances?status=closed" },
  {
    key: "high_priority",
    labelKey: "highPriority",
    href: "/ps/grievances?priority=high_priority",
  },
  { key: "overdue_cases", labelKey: "overdueCases", href: "/ps/grievances?overdue=true" },
];

function localizeSlices(
  slices: PsMisAnalyticsData["by_status"],
  t: (ns: "ps", key: string) => string,
  prefix: string,
) {
  return slices.map((slice) => {
    const key = `${prefix}.${slice.key}`;
    const localized = t("ps", key);
    return {
      ...slice,
      label: localized === key ? slice.label.replace(/_/g, " ") : localized,
    };
  });
}

export function PsMisView({ data }: { data: PsMisAnalyticsData }) {
  const { t } = useI18n();

  const statusSlices = localizeSlices(data.by_status, t, "mis.status");
  const prioritySlices = localizeSlices(data.by_priority, t, "mis.priority");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {CARD_DEFS.map((card, index) => (
          <StatCard
            key={card.key}
            label={t("ps", `mis.cards.${card.labelKey}`)}
            value={data.summary[card.key] ?? 0}
            href={card.href}
            tone={index}
            compact
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MisPieChart
          title={t("ps", "mis.charts.status")}
          slices={statusSlices}
          emptyLabel={t("ps", "mis.charts.empty")}
        />
        <MisPieChart
          title={t("ps", "mis.charts.priority")}
          slices={prioritySlices}
          emptyLabel={t("ps", "mis.charts.empty")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MisBarChart
          title={t("ps", "mis.charts.byOsd")}
          slices={data.by_osd}
          emptyLabel={t("ps", "mis.charts.empty")}
        />
        <MisBarChart
          title={t("ps", "mis.charts.byDepartment")}
          slices={data.by_department}
          emptyLabel={t("ps", "mis.charts.empty")}
        />
      </div>

      <MisTrendChart
        title={t("ps", "mis.charts.trend14d")}
        slices={data.trend_14d}
        emptyLabel={t("ps", "mis.charts.empty")}
      />
    </div>
  );
}
