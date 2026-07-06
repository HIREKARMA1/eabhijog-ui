import { PsLayout } from "@/components/layout/PsLayout";
import { PsDashboardOverview } from "@/components/ps/PsDashboardOverview";
import { getPsDashboard } from "@/lib/api/server-portal";

export default async function PsDashboardPage() {
  const dashboard = await getPsDashboard();

  return (
    <PsLayout breadcrumb={<strong>Private Secretary Dashboard</strong>}>
      <PsDashboardOverview data={dashboard} />
    </PsLayout>
  );
}
