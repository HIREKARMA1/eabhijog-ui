"use client";

import Link from "next/link";

import { GrievanceFilters } from "@/components/grievance/GrievanceFilters";
import { OsdVolumeGrid } from "@/components/osd/dashboard/OsdSummaryGrid";
import { PsGrievanceTable } from "@/components/ps/PsGrievanceTable";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/lib/i18n/context";
import type { MetadataConstants, OsdDashboardData } from "@/types/api";

type OsdDashboardOverviewProps = {
  data: OsdDashboardData;
  osdSlug: string;
  constants: MetadataConstants;
  filters: Record<string, string>;
  isSuperAdmin?: boolean;
};

export function OsdDashboardOverview({
  data,
  osdSlug,
  constants,
  filters,
  isSuperAdmin = false,
}: OsdDashboardOverviewProps) {
  const { t } = useI18n();
  const viewAllHref = (() => {
    const params = new URLSearchParams();
    if (filters.osd_category) params.set("osd_category", filters.osd_category);
    if (filters.filing_source) params.set("filing_source", filters.filing_source);
    const qs = params.toString();
    return qs ? `/osd/${osdSlug}/grievances?${qs}` : `/osd/${osdSlug}/grievances`;
  })();

  return (
    <div className="space-y-4">
      <Section
        title={t("dashboard", "osdDashboard.volume")}
        className="rounded-2xl bg-white/55 p-4 shadow-sm ring-1 ring-white/70"
      >
        <div className="space-y-3">
          <GrievanceFilters
            basePath={`/osd/${osdSlug}/dashboard`}
            variant="desk"
            listMode="dashboard"
            statuses={constants.statuses}
            districts={constants.districts}
            categories={constants.grievance_categories}
            osdCategories={constants.osd_categories}
          />
          <OsdVolumeGrid
            summary={data.summary}
            osdSlug={osdSlug}
            extraParams={filters}
          />
        </div>
      </Section>

      {/* Summary workflow cards hidden for now
      <Section
        title={t("dashboard", "osdDashboard.summary")}
        className="rounded-2xl bg-white/55 p-4 shadow-sm ring-1 ring-white/70"
      >
        <OsdSummaryGrid summary={data.summary} osdSlug={osdSlug} />
      </Section>
      */}

      <Section
        title={t("dashboard", "osdDashboard.recent")}
        className="rounded-2xl bg-white/55 p-4 shadow-sm ring-1 ring-white/70"
        action={
          <Link href={viewAllHref} className="text-sm font-medium text-link hover:underline">
            {t("dashboard", "osdDashboard.viewAll")}
          </Link>
        }
      >
        <PsGrievanceTable
          items={data.recent_grievances}
          detailHrefPrefix={`/osd/${osdSlug}/grievance/`}
          isSuperAdmin={isSuperAdmin}
        />
      </Section>
    </div>
  );
}
