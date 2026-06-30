import { Suspense } from "react";

import { GrievanceFilters } from "@/components/grievance/GrievanceFilters";
import { GrievanceTable } from "@/components/grievance/GrievanceTable";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/ui/Card";
import { getConstants, getPortalOperational } from "@/lib/api/server-portal";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function GrievancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = {
    status: params.status ?? "",
    district: params.district ?? "",
    search: params.search ?? "",
  };
  const [data, constants] = await Promise.all([
    getPortalOperational(filters),
    getConstants(),
  ]);

  const kpis = [
    { labelKey: "kpi.pendingRedressal", value: data.kpi.pending_redressal ?? data.pending_count },
    { labelKey: "kpi.resolutionRate", value: `${data.kpi.resolution_rate_pct ?? 0}%` },
    { labelKey: "kpi.overdueSla", value: data.kpi.overdue_sla ?? 0 },
    { labelKey: "kpi.whatsappInflow", value: data.kpi.whatsapp_inflow ?? 0 },
  ];

  return (
    <PortalLayout breadcrumb="Grievances" extraCss={["ops-command.css"]} bodyClass="ops-command-page">
      <div className="space-y-5">
        <KpiGrid items={kpis} />
        <Suspense fallback={null}>
          <GrievanceFilters
            statuses={constants.statuses}
            districts={constants.districts}
            basePath="/dashboard/grievances"
          />
        </Suspense>
        <Card>
          <GrievanceTable
            rows={data.grievances}
            detailHrefPrefix="/dashboard/grievance/"
          />
        </Card>
      </div>
    </PortalLayout>
  );
}
