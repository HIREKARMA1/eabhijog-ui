"use client";

import { Suspense } from "react";

import { DeskOutcomeCards } from "@/components/dashboard/DeskOutcomeCards";
import { GrievanceAnalyticsCharts } from "@/components/dashboard/GrievanceAnalyticsCharts";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/lib/i18n/context";
import type { OsdDashboardData } from "@/types/api";

type OsdDashboardOverviewProps = {
  data: OsdDashboardData;
};

export function OsdDashboardOverview({ data }: OsdDashboardOverviewProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {data.desk_breakdown ? (
        <Suspense fallback={null}>
          <DeskOutcomeCards breakdown={data.desk_breakdown} />
        </Suspense>
      ) : null}

      <Section title={t("dashboard", "osdDashboard.charts.title")}>
        <Suspense fallback={null}>
          <GrievanceAnalyticsCharts charts={data.charts} />
        </Suspense>
      </Section>
    </div>
  );
}
