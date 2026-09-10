"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import type { OsdDeskBreakdown, OsdDeskBreakdownDesk } from "@/types/api";

type DeskOutcomeCardsProps = {
  breakdown: OsdDeskBreakdown;
};

type OutcomeMetric = "total" | "open" | "resolved" | "disposed";

function deskTotal(desk: OsdDeskBreakdownDesk) {
  return desk.open + desk.resolved + desk.closed + desk.rejected;
}

const ROW_THEMES: Record<
  OutcomeMetric,
  {
    row: string;
    title: string;
    value: string;
    desk: string;
    deskValue: string;
    deskLabel: string;
  }
> = {
  total: {
    row: "border-navy-600/25 bg-white",
    title: "text-navy-700",
    value: "text-navy-900",
    desk: "border-navy-600/20 bg-white",
    deskValue: "text-navy-800",
    deskLabel: "text-navy-600",
  },
  open: {
    row: "border-sky-200 bg-white",
    title: "text-sky-700",
    value: "text-sky-950",
    desk: "border-sky-200/80 bg-white hover:border-sky-400 hover:bg-sky-50",
    deskValue: "text-sky-800",
    deskLabel: "text-sky-600",
  },
  disposed: {
    row: "border-amber-200 bg-white",
    title: "text-amber-800",
    value: "text-amber-950",
    desk: "border-amber-200/80 bg-white hover:border-amber-400 hover:bg-amber-50",
    deskValue: "text-amber-900",
    deskLabel: "text-amber-700",
  },
  resolved: {
    row: "border-emerald-200 bg-white",
    title: "text-emerald-700",
    value: "text-emerald-950",
    desk: "border-emerald-200/80 bg-white hover:border-emerald-400 hover:bg-emerald-50",
    deskValue: "text-emerald-800",
    deskLabel: "text-emerald-600",
  },
};

const DESK_DOTS = ["bg-saffron", "bg-sky-500", "bg-violet-500", "bg-teal-500", "bg-slate-500"] as const;

function keepChartParams(params: URLSearchParams) {
  const next = new URLSearchParams();
  for (const key of ["chart_period", "chart_from", "chart_to"]) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  return next;
}

function DeskBox({
  desk,
  metric,
  extra,
  index,
}: {
  desk: OsdDeskBreakdownDesk;
  metric: OutcomeMetric;
  extra?: boolean;
  index: number;
}) {
  const { t } = useI18n();
  const theme = ROW_THEMES[metric];
  const clickable = metric !== "total";
  const href =
    metric === "disposed"
      ? desk.hrefs.closed
      : metric === "open"
        ? desk.hrefs.open
        : desk.hrefs.resolved;
  const value = metric === "total" ? deskTotal(desk) : desk[metric];
  const className = cn(
    "min-w-0 rounded-xl border px-2.5 py-2 shadow-sm",
    clickable && "no-underline transition",
    theme.desk,
  );
  const content = (
    <>
      <p className={cn("flex items-center gap-1.5 truncate text-[10px] font-semibold uppercase tracking-wide", theme.deskLabel)}>
        <span className={cn("h-2 w-2 shrink-0 rounded-full", DESK_DOTS[index % DESK_DOTS.length])} />
        {desk.label}
      </p>
      <p className={cn("mt-1 text-lg font-bold tabular-nums", theme.deskValue)}>{value}</p>
      {extra ? (
        <p className="mt-1 text-[10px] leading-snug text-text-muted">
          <span className="text-slate-600">
            {t("dashboard", "osdDashboard.closed")} {desk.closed}
          </span>
          {" · "}
          <span className="text-rose-600">
            {t("dashboard", "osdDashboard.rejected")} {desk.rejected}
          </span>
        </p>
      ) : null}
    </>
  );

  if (!clickable) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function OutcomeRow({
  title,
  value,
  href,
  desks,
  metric,
  extraLeft,
}: {
  title: string;
  value: number;
  href?: string;
  desks: OsdDeskBreakdownDesk[];
  metric: OutcomeMetric;
  extraLeft?: ReactNode;
}) {
  const theme = ROW_THEMES[metric];
  const heading = (
    <>
      <p className={cn("text-xs font-semibold uppercase tracking-[0.14em]", theme.title)}>{title}</p>
      <p className={cn("mt-2 text-3xl font-extrabold tabular-nums", theme.value)}>{value}</p>
    </>
  );

  return (
    <div
      className={cn(
        "grid gap-4 rounded-2xl border p-4 shadow-sm lg:grid-cols-[minmax(13rem,18rem)_1fr]",
        theme.row,
      )}
    >
      <div className="flex min-w-0 flex-col justify-center border-b border-black/5 pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        {href ? (
          <Link href={href} className="no-underline">
            {heading}
          </Link>
        ) : (
          <div>{heading}</div>
        )}
        {extraLeft}
      </div>
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {desks.map((desk, index) => (
          <DeskBox key={desk.key} desk={desk} metric={metric} extra={metric === "disposed"} index={index} />
        ))}
      </div>
    </div>
  );
}

export function DeskOutcomeCards({ breakdown }: DeskOutcomeCardsProps) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = searchParams.get("filing_source") ?? "";
  const desks = breakdown.desks;
  const totals = breakdown.totals;

  function onSourceChange(value: string) {
    const next = keepChartParams(searchParams);
    if (value) next.set("filing_source", value);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="h-1.5 w-10 rounded-full bg-saffron/80" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            {t("dashboard", "osdDashboard.volume")}
          </h2>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span className="text-xs font-medium text-text-muted">
            {t("dashboard", "filters.source")}
          </span>
          <select
            value={source}
            onChange={(event) => onSourceChange(event.target.value)}
            className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm"
            aria-label={t("dashboard", "filters.source")}
          >
            <option value="">{t("dashboard", "filters.all")}</option>
            <option value="chatbot">{t("dashboard", "filters.sourceChatbot")}</option>
            <option value="online_hearing">{t("dashboard", "filters.sourceOnlineHearing")}</option>
          </select>
        </label>
      </div>

      <OutcomeRow
        title={t("dashboard", "osdDashboard.totalGrievances")}
        value={desks.reduce((sum, desk) => sum + deskTotal(desk), 0)}
        desks={desks}
        metric="total"
      />
      <OutcomeRow
        title={t("dashboard", "osdDashboard.openTotal")}
        value={totals.open}
        href={totals.hrefs.open}
        desks={desks}
        metric="open"
      />
      <OutcomeRow
        title={t("dashboard", "osdDashboard.disposedTotal")}
        value={totals.disposed}
        href={totals.hrefs.closed}
        desks={desks}
        metric="disposed"
        extraLeft={
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={totals.hrefs.closed}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2 no-underline shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <p className="text-[10px] font-semibold uppercase text-slate-500">
                {t("dashboard", "osdDashboard.closed")}
              </p>
              <p className="text-lg font-bold tabular-nums text-slate-800">{totals.closed}</p>
            </Link>
            <Link
              href={totals.hrefs.rejected}
              className="rounded-lg border border-rose-200 bg-white px-2 py-2 no-underline shadow-sm transition hover:border-rose-400 hover:bg-rose-50"
            >
              <p className="text-[10px] font-semibold uppercase text-rose-600">
                {t("dashboard", "osdDashboard.rejected")}
              </p>
              <p className="text-lg font-bold tabular-nums text-rose-800">{totals.rejected}</p>
            </Link>
          </div>
        }
      />
      <OutcomeRow
        title={t("dashboard", "osdDashboard.resolvedTotal")}
        value={totals.resolved}
        href={totals.hrefs.resolved}
        desks={desks}
        metric="resolved"
      />
    </div>
  );
}
