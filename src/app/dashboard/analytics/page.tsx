import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getPortalAnalytics } from "@/lib/api/server-portal";

export default async function AnalyticsPage() {
  const data = await getPortalAnalytics();

  return (
    <PortalLayout breadcrumb="Reports" extraCss={["analytics.css"]} bodyClass="analytics-page">
      <AnalyticsOverview data={data} />
    </PortalLayout>
  );
}
