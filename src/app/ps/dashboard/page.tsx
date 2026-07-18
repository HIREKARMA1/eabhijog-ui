import { redirect } from "next/navigation";

import { PsLayout } from "@/components/layout/PsLayout";
import { PsDashboardOverview } from "@/components/ps/PsDashboardOverview";
import { getPsDashboard } from "@/lib/api/server-portal";

export default async function PsDashboardPage() {
  let dashboard;
  try {
    dashboard = await getPsDashboard();
  } catch {
    redirect("/login");
  }

  return (
    <PsLayout breadcrumb={<strong>Private Secretary Dashboard</strong>}>
      <PsDashboardOverview data={dashboard} />
    </PsLayout>
  );
}
