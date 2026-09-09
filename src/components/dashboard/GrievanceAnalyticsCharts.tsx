"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MisBarChart, MisPieChart, MisTrendChart } from "@/components/ps/MisCharts";
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

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function lastDayOfMonth(yearMonth: string) {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 0));
  return date.toISOString().slice(0, 10);
}

export function GrievanceAnalyticsCharts({ charts }: { charts?: OsdDashboardCharts | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = (searchParams.get("chart_period") as RegistrationPeriod) === "month" ? "month" : "week";
  const rangeFrom = searchParams.get("chart_from") || charts?.range_from || "";
  const rangeTo = searchParams.get("chart_to") || charts?.range_to || "";
  const empty = t("dashboard", "osdDashboard.charts.empty");
  const statusSlices = localizeSlices(charts?.status_slices ?? [], t);
  const outcomeSlices = localizeSlices(charts?.outcome_slices ?? [], t);
  const trendSlices =
    period === "month" ? (charts?.monthly_registered ?? []) : (charts?.weekly_registered ?? []);
  const monthLabel = charts?.month_label || rangeFrom.slice(5, 7);

  function pushChart(nextPeriod: RegistrationPeriod, from: string, to: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("chart_period", nextPeriod);
    if (from) next.set("chart_from", from);
    else next.delete("chart_from");
    if (to) next.set("chart_to", to);
    else next.delete("chart_to");
    router.push(`${pathname}?${next.toString()}`);
  }

  function onPeriodChange(nextPeriod: RegistrationPeriod) {
    if (nextPeriod === "week") {
      const start = rangeFrom || new Date().toISOString().slice(0, 10);
      pushChart("week", start, addDays(start, 6));
      return;
    }
    const month = (rangeFrom || new Date().toISOString().slice(0, 7)).slice(0, 7);
    pushChart("month", `${month}-01`, lastDayOfMonth(month));
  }

  function onWeekFromChange(from: string) {
    if (!from) return;
    pushChart("week", from, addDays(from, 6));
  }

  function onWeekToChange(to: string) {
    if (!to) return;
    pushChart("week", addDays(to, -6), to);
  }

  function onMonthChange(yearMonth: string) {
    if (!yearMonth) return;
    pushChart("month", `${yearMonth}-01`, lastDayOfMonth(yearMonth));
  }

  const monthValue = (rangeFrom || "").slice(0, 7);
  const title =
    period === "month"
      ? t("dashboard", "osdDashboard.charts.thisMonth", { month: monthLabel })
      : t("dashboard", "osdDashboard.charts.weekly");

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
      <div className="flex h-full min-h-0 min-w-0 isolate overflow-hidden">
        <MisPieChart
          title={t("dashboard", "osdDashboard.charts.status")}
          slices={statusSlices}
          emptyLabel={empty}
          className="h-full min-h-70 w-full"
        />
      </div>
      <div className="flex h-full min-h-0 min-w-0 isolate overflow-hidden">
        <MisBarChart
          title={t("dashboard", "osdDashboard.charts.outcomes")}
          slices={outcomeSlices}
          emptyLabel={empty}
          className="h-full min-h-70 w-full"
        />
      </div>
      <div className="min-w-0 isolate overflow-hidden lg:col-span-2">
        <MisTrendChart
          title={title}
          slices={trendSlices}
          emptyLabel={empty}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={period}
                aria-label={t("dashboard", "osdDashboard.charts.period")}
                onChange={(event) => onPeriodChange(event.target.value as RegistrationPeriod)}
                className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm"
              >
                <option value="week">{t("dashboard", "osdDashboard.charts.week")}</option>
                <option value="month">{t("dashboard", "osdDashboard.charts.month")}</option>
              </select>
              {period === "week" ? (
                <>
                  <input
                    type="date"
                    value={rangeFrom}
                    onChange={(event) => onWeekFromChange(event.target.value)}
                    aria-label={t("dashboard", "osdDashboard.charts.dateFrom")}
                    className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm shadow-sm"
                  />
                  <input
                    type="date"
                    value={rangeTo}
                    onChange={(event) => onWeekToChange(event.target.value)}
                    aria-label={t("dashboard", "osdDashboard.charts.dateTo")}
                    className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm shadow-sm"
                  />
                </>
              ) : (
                <input
                  type="month"
                  value={monthValue}
                  onChange={(event) => onMonthChange(event.target.value)}
                  aria-label={t("dashboard", "osdDashboard.charts.month")}
                  className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm shadow-sm"
                />
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
