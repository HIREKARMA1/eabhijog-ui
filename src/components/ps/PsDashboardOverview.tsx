"use client";

import Link from "next/link";

import { PsAnalyticsGrid } from "@/components/ps/dashboard/PsAnalyticsGrid";
import { PsRecentGrievancesTable } from "@/components/ps/dashboard/PsRecentGrievancesTable";
import { PsSummaryGrid } from "@/components/ps/dashboard/PsSummaryGrid";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/lib/i18n/context";
import type { PsDashboardData } from "@/types/api";

export function PsDashboardOverview({ data }: { data: PsDashboardData }) {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)] xl:items-start">
        <div className="space-y-6">
          <Section
            title={t("ps", "sections.summary")}
            className="rounded-3xl bg-white/55 p-5 shadow-sm ring-1 ring-white/70"
          >
            <PsSummaryGrid summary={data.summary} />
          </Section>

          <Section
            title={t("ps", "sections.recent")}
            className="rounded-3xl bg-white/55 p-5 shadow-sm ring-1 ring-white/70"
            action={
              <Link href="/ps/grievances" className="text-sm font-medium text-link hover:underline">
                {t("ps", "recent.viewAll")}
              </Link>
            }
          >
            <PsRecentGrievancesTable items={data.recent_grievances} />
          </Section>
        </div>

        <Section
          title={t("ps", "sections.analytics")}
          className="rounded-3xl bg-white/55 p-5 shadow-sm ring-1 ring-white/70"
        >
          <PsAnalyticsGrid analytics={data.analytics} />
        </Section>
      </div>
    </div>
  );
}
