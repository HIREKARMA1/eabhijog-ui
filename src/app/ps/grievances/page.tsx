import Link from "next/link";

import { PsLayout } from "@/components/layout/PsLayout";
import { PsGrievancesView } from "@/components/ps/PsGrievancesView";
import { getConstants } from "@/lib/api/server-portal";
import { isMockDataMode } from "@/config/env";
import { getMockPsGrievances } from "@/lib/data/mock-loader";
import { serverApiRequest } from "@/lib/api/server";
import type { PsGrievanceRow } from "@/types/api";

type PageProps = { searchParams: Promise<Record<string, string | undefined>> };
const PAGE_SIZE = 10;

export default async function PsGrievancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v) filters[k] = v;
  }
  const currentPage = Math.max(1, Number(filters.page || "1") || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const constants = await getConstants();

  let items: PsGrievanceRow[];
  let total: number;

  if (isMockDataMode()) {
    const mock = await getMockPsGrievances();
    items = mock.items.slice(offset, offset + PAGE_SIZE);
    total = mock.total;
  } else {
    const requestFilters = new URLSearchParams(filters);
    requestFilters.set("limit", String(PAGE_SIZE));
    requestFilters.set("offset", String(offset));
    const qs = requestFilters.toString();
    const path = qs ? `/api/ps/grievances?${qs}` : "/api/ps/grievances";
    const grievancesResult = await serverApiRequest<{ items: PsGrievanceRow[]; total: number }>(
      path,
    );
    items = grievancesResult.data.items;
    total = grievancesResult.data.total;
  }

  return (
    <PsLayout
      breadcrumb={
        <>
          <Link href="/ps/dashboard" className="hover:text-slate-900 hover:underline">
            Private Secretary Dashboard
          </Link>
          {" > "}
          <strong className="text-slate-900">Grievances</strong>
        </>
      }
    >
      <PsGrievancesView
        items={items}
        total={total}
        constants={constants}
        filters={filters}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        showHeader={false}
      />
    </PsLayout>
  );
}
