"use client";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/context";
import type { PortalAnalyticsData } from "@/types/api";

export function AnalyticsOverview({ data }: { data: PortalAnalyticsData }) {
  const { t } = useI18n();
  const { overview, status_breakdown, trends_7d } = data.bundle;
  const { feedback } = data;

  const kpis = [
    { label: t("dashboard", "kpi.total"), value: overview.total_grievances },
    { label: t("dashboard", "kpi.open"), value: overview.open_count },
    { label: t("dashboard", "kpi.closed"), value: overview.closed_count },
    { label: t("dashboard", "analytics.avgRating"), value: feedback.average_rating?.toFixed(1) ?? "—" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs uppercase tracking-wide text-text-muted">{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t("dashboard", "analytics.statusBreakdown")}>
          <ul className="space-y-2 text-sm">
            {status_breakdown.items.map((item) => (
              <li key={item.key} className="flex justify-between gap-3">
                <span>{item.key.replace(/_/g, " ")}</span>
                <span className="font-semibold">{item.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t("dashboard", "analytics.trends")}>
          <ul className="space-y-2 text-sm">
            {trends_7d.points.map((point) => (
              <li key={point.period_label} className="flex justify-between gap-3">
                <span>{point.period_label}</span>
                <span>
                  {point.submitted} / {point.resolved}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
