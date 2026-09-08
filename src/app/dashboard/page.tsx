import { Bi } from "@/lib/i18n/bi";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { getCurrentUser, getPortalDashboard } from "@/lib/api/server-portal";
import { isSuperAdmin } from "@/lib/auth/roles";

export default async function DashboardPage() {
  const [dashboard, staff] = await Promise.all([getPortalDashboard(), getCurrentUser()]);

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
        isSuperAdmin={isSuperAdmin(staff)}
      />
    </PortalLayout>
  );
}
