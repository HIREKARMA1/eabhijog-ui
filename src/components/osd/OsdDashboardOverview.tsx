"use client";

import Link from "next/link";

import { PsGrievanceTable } from "@/components/ps/PsGrievanceTable";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/lib/i18n/context";
import type { OsdDashboardData } from "@/types/api";

type OsdDashboardOverviewProps = {
  data: OsdDashboardData;
  osdSlug: string;
};

export function OsdDashboardOverview({ data, osdSlug }: OsdDashboardOverviewProps) {
  const { t } = useI18n();

  const kpis = [
    { labelKey: "osdSummary.assignedToday", value: data.summary.assigned_today ?? 0 },
    {
      labelKey: "osdSummary.pendingAck",
      value: data.summary.pending_acknowledgement ?? data.summary.pending ?? 0,
    },
    {
      labelKey: "osdSummary.waitingDept",
      value: data.summary.waiting_for_department ?? data.summary.action_pending ?? 0,
    },
    { labelKey: "osdSummary.deptResponded", value: data.summary.department_responded ?? 0 },
    { labelKey: "osdSummary.citizenWaiting", value: data.summary.citizen_waiting ?? 0 },
    { labelKey: "osdSummary.resolvedToday", value: data.summary.resolved_today ?? 0 },
    { labelKey: "osdSummary.overdue", value: data.summary.overdue_cases ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-white/90 px-5 py-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-saffron">OSD Desk</p>
        <p className="mt-2 text-sm text-text-muted">{data.osd_category}</p>
      </div>

      <div className="rounded-3xl bg-white/55 p-5 shadow-sm ring-1 ring-white/70">
        <KpiGrid items={kpis} />
      </div>

      <Section
        title={t("dashboard", "osdDashboard.recent")}
        className="rounded-3xl bg-white/55 p-5 shadow-sm ring-1 ring-white/70"
        action={
          <Link
            href={`/osd/${osdSlug}/grievances`}
            className="text-sm font-medium text-link hover:underline"
          >
            {t("dashboard", "osdDashboard.viewAll")}
          </Link>
        }
      >
        <PsGrievanceTable
          items={data.recent_grievances}
          detailHrefPrefix={`/osd/${osdSlug}/grievance/`}
        />
      </Section>
    </div>
  );
}
