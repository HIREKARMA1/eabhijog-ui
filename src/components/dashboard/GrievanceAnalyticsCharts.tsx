"use client";

import { useState } from "react";

import { MisBarChart, MisPieChart, MisTrendChart } from "@/components/ps/MisCharts";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/context";
import type { OsdChartSlice, OsdDashboardCharts } from "@/types/api";

type RegistrationPeriod = "week" | "month";

function localizeSlices(
  slices: OsdChartSlice[],
  t: (namespace: "dashboard", key: string) => string,
) {
  return slices.map((slice) => {
    const key = `osdDashboard.charts.${slice.key}`;
    const localized = t("dashboard", key);
    return { ...slice, label: localized === key ? slice.label : localized };
  });
}

export function GrievanceAnalyticsCharts({ charts }: { charts?: OsdDashboardCharts | null }) {
  const { t } = useI18n();
  const [period, setPeriod] = useState<RegistrationPeriod>("week");
  const empty = t("dashboard", "osdDashboard.charts.empty");
  const statusSlices = localizeSlices(charts?.status_slices ?? [], t);
  const outcomeSlices = localizeSlices(charts?.outcome_slices ?? [], t);
  const weeklySlices = charts?.weekly_registered ?? [];
  const monthlySlices = charts?.monthly_registered ?? [];
  const trendSlices = period === "month" ? monthlySlices : weeklySlices;
  const successRate = charts?.success_rate_pct ?? 0;

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <div className="min-w-0 isolate overflow-hidden">
        <MisPieChart
          title={t("dashboard", "osdDashboard.charts.status")}
          slices={statusSlices}
          emptyLabel={empty}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4 isolate overflow-hidden">
        <StatCard
          label={t("dashboard", "osdDashboard.charts.successRate")}
          value={`${successRate}%`}
          tone={2}
          compact
          className="h-auto min-h-0"
        />
        <MisBarChart
          title={t("dashboard", "osdDashboard.charts.outcomes")}
          slices={outcomeSlices}
          emptyLabel={empty}
        />
      </div>
      <div className="min-w-0 isolate overflow-hidden lg:col-span-2">
        <MisTrendChart
          title={
            period === "month"
              ? t("dashboard", "osdDashboard.charts.monthly")
              : t("dashboard", "osdDashboard.charts.weekly")
          }
          slices={trendSlices}
          emptyLabel={empty}
          action={
            <select
              value={period}
              aria-label={t("dashboard", "osdDashboard.charts.period")}
              onChange={(event) => setPeriod(event.target.value as RegistrationPeriod)}
              className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm"
            >
              <option value="week">{t("dashboard", "osdDashboard.charts.week")}</option>
              <option value="month">{t("dashboard", "osdDashboard.charts.month")}</option>
            </select>
          }
        />
      </div>
    </div>
  );
}
