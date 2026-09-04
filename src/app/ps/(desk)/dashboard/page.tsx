import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsDashboardOverview } from "@/components/ps/PsDashboardOverview";
import { getPsDashboard } from "@/lib/api/server-portal";

export default async function PsDashboardPage() {
  let dashboard;
  try {
    dashboard = await getPsDashboard();
  } catch {
    return (
      <>
        <SetBreadcrumb>
          <strong>Private Secretary Dashboard</strong>
        </SetBreadcrumb>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Could not load the dashboard. Refresh the page or open Grievances from the sidebar.
        </p>
      </>
    );
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
