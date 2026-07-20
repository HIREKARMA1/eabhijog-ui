"use client";

import Link from "next/link";

import { OsdSummaryGrid } from "@/components/osd/dashboard/OsdSummaryGrid";
import { PsGrievanceTable } from "@/components/ps/PsGrievanceTable";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/lib/i18n/context";
import type { OsdDashboardData } from "@/types/api";

type OsdDashboardOverviewProps = {
  data: OsdDashboardData;
  osdSlug: string;
};

export function OsdDashboardOverview({ data, osdSlug }: OsdDashboardOverviewProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <Section
        title={t("dashboard", "osdDashboard.summary")}
        className="rounded-2xl bg-white/55 p-4 shadow-sm ring-1 ring-white/70"
      >
        <OsdSummaryGrid summary={data.summary} osdSlug={osdSlug} />
      </Section>

      <Section
        title={t("dashboard", "osdDashboard.recent")}
        className="rounded-2xl bg-white/55 p-4 shadow-sm ring-1 ring-white/70"
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
