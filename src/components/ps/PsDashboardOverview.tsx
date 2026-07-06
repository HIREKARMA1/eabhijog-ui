"use client";

import Link from "next/link";

import { PsAnalyticsGrid } from "@/components/ps/dashboard/PsAnalyticsGrid";
import { PsRecentGrievancesTable } from "@/components/ps/dashboard/PsRecentGrievancesTable";
import { PsSummaryGrid } from "@/components/ps/dashboard/PsSummaryGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/lib/i18n/context";
import type { PsDashboardData } from "@/types/api";

export function PsDashboardOverview({ data }: { data: PsDashboardData }) {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <PageHeader title={t("ps", "title")} description={t("ps", "subtitle")} />

      <Section title={t("ps", "sections.summary")}>
        <PsSummaryGrid summary={data.summary} />
      </Section>

      <Section title={t("ps", "sections.analytics")}>
        <PsAnalyticsGrid analytics={data.analytics} />
      </Section>

      <Section
        title={t("ps", "sections.recent")}
        action={
          <Link href="/ps/grievances" className="text-sm font-medium text-link hover:underline">
            {t("ps", "recent.viewAll")}
          </Link>
        }
      >
        <PsRecentGrievancesTable items={data.recent_grievances} />
      </Section>
    </div>
  );
}
