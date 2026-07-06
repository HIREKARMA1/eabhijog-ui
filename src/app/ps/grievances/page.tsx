import { PsLayout } from "@/components/layout/PsLayout";
import { PsGrievanceFilters } from "@/components/ps/PsGrievanceFilters";
import { PsGrievanceTable } from "@/components/ps/PsGrievanceTable";
import { getConstants } from "@/lib/api/server-portal";
import { serverApiRequest } from "@/lib/api/server";
import type { PsGrievanceRow } from "@/types/api";

type PageProps = { searchParams: Promise<Record<string, string | undefined>> };

export default async function PsGrievancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v) filters[k] = v;
  }

  const qs = new URLSearchParams(filters).toString();
  const path = qs ? `/api/ps/grievances?${qs}` : "/api/ps/grievances";

  const [constants, grievancesResult] = await Promise.all([
    getConstants(),
    serverApiRequest<{ items: PsGrievanceRow[]; total: number }>(path),
  ]);

  const { items, total } = grievancesResult.data;

  return (
    <PsLayout breadcrumb={<strong>Grievances</strong>}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Grievance Registry</h1>
          <p className="text-sm text-text-muted">{total} total</p>
        </div>
        <PsGrievanceFilters basePath="/ps/grievances" constants={constants} current={filters} />
        <PsGrievanceTable items={items} />
      </div>
    </PsLayout>
  );
}
