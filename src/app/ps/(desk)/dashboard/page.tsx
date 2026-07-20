import { redirect } from "next/navigation";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
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
    <>
      <SetBreadcrumb>
        <strong>Private Secretary Dashboard</strong>
      </SetBreadcrumb>
      <PsDashboardOverview data={dashboard} />
    </>
  );
}
