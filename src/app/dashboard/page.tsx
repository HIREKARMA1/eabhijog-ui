import { Bi } from "@/lib/i18n/bi";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { getCurrentUser, getPortalDashboard } from "@/lib/api/server-portal";
import { isSuperAdmin } from "@/lib/auth/roles";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const [dashboard, staff] = await Promise.all([
    getPortalDashboard({
      filingSource: query.filing_source,
      chartPeriod: query.chart_period,
      chartFrom: query.chart_from,
      chartTo: query.chart_to,
    }),
    getCurrentUser(),
  ]);

  return (
    <PortalLayout
      breadcrumb={
        <strong>
          <Bi en="Dashboard" or="ଡ୍ୟାସବୋର୍ଡ" />
        </strong>
      }
    >
      <DashboardOverview
        summary={dashboard.summary}
        kpi={dashboard.kpi}
        charts={dashboard.charts}
        deskBreakdown={dashboard.desk_breakdown}
        isSuperAdmin={isSuperAdmin(staff)}
      />
    </PortalLayout>
  );
}
