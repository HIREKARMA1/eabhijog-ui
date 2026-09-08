"use client";

import { GrievanceAnalyticsCharts } from "@/components/dashboard/GrievanceAnalyticsCharts";
import { GrievanceFilters } from "@/components/grievance/GrievanceFilters";
import { OsdVolumeGrid } from "@/components/osd/dashboard/OsdSummaryGrid";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/lib/i18n/context";
import type { MetadataConstants, OsdDashboardData } from "@/types/api";

type OsdDashboardOverviewProps = {
  data: OsdDashboardData;
  osdSlug: string;
  constants: MetadataConstants;
  filters: Record<string, string>;
};

export function OsdDashboardOverview({
  data,
  osdSlug,
  constants,
  filters,
}: OsdDashboardOverviewProps) {
  const { t } = useI18n();

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

      <Section
        title={t("dashboard", "osdDashboard.charts.title")}
        className="rounded-2xl bg-white/55 p-4 shadow-sm ring-1 ring-white/70"
      >
        <GrievanceAnalyticsCharts charts={data.charts} />
      </Section>
    </div>
  );
}
