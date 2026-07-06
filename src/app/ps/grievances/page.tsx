import { PsLayout } from "@/components/layout/PsLayout";
import { PsGrievancesView } from "@/components/ps/PsGrievancesView";
import { getConstants } from "@/lib/api/server-portal";
import { isMockDataMode } from "@/config/env";
import { getMockPsGrievances } from "@/lib/data/mock-loader";
import { serverApiRequest } from "@/lib/api/server";
import type { PsGrievanceRow } from "@/types/api";

type PageProps = { searchParams: Promise<Record<string, string | undefined>> };

export default async function PsGrievancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v) filters[k] = v;
  }

  const constants = await getConstants();

  let items: PsGrievanceRow[];
  let total: number;

  if (isMockDataMode()) {
    const mock = await getMockPsGrievances();
    items = mock.items;
    total = mock.total;
  } else {
    const qs = new URLSearchParams(filters).toString();
    const path = qs ? `/api/ps/grievances?${qs}` : "/api/ps/grievances";
    const grievancesResult = await serverApiRequest<{ items: PsGrievanceRow[]; total: number }>(
      path,
    );
    items = grievancesResult.data.items;
    total = grievancesResult.data.total;
  }

  return (
    <PsLayout breadcrumb={<strong>Grievances</strong>}>
      <PsGrievancesView items={items} total={total} constants={constants} filters={filters} />
    </PsLayout>
  );
}
