import Link from "next/link";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsGrievancesView } from "@/components/ps/PsGrievancesView";
import { getConstants } from "@/lib/api/server-portal";
import { isMockDataMode } from "@/config/env";
import { getMockPsGrievances } from "@/lib/data/mock-loader";
import { serverApiRequest } from "@/lib/api/server";
import type { MetadataConstants, PsGrievanceRow } from "@/types/api";

type PageProps = { searchParams: Promise<Record<string, string | undefined>> };
const PAGE_SIZE = 10;
const DEFAULT_STATUS = "disposed_grievances";

export default async function PsDisposedGrievancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v) filters[k] = v;
  }
  if (!filters.status) filters.status = DEFAULT_STATUS;

  const currentPage = Math.max(1, Number(filters.page || "1") || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  let constants: MetadataConstants | null = null;
  let items: PsGrievanceRow[] = [];
  let total = 0;
  let loadError = false;

  try {
    constants = await getConstants();

    if (isMockDataMode()) {
      const mock = await getMockPsGrievances();
      items = mock.items.slice(offset, offset + PAGE_SIZE);
      total = mock.total;
    } else {
      const requestFilters = new URLSearchParams(filters);
      requestFilters.set("limit", String(PAGE_SIZE));
      requestFilters.set("offset", String(offset));
      const qs = requestFilters.toString();
      const path = `/api/ps/grievances?${qs}`;
      const grievancesResult = await serverApiRequest<{ items: PsGrievanceRow[]; total: number }>(
        path,
      );
      items = grievancesResult.data.items;
      total = grievancesResult.data.total;
    }
  } catch {
    loadError = true;
  }

  return (
    <>
      <SetBreadcrumb>
        <Link href="/ps/dashboard" className="hover:text-slate-900 hover:underline">
          Private Secretary Dashboard
        </Link>
        {" > "}
        <strong className="text-slate-900">Disposed Grievances</strong>
      </SetBreadcrumb>
      {loadError || !constants ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Could not load disposed grievances. Refresh the page after the API/database is available.
        </p>
      ) : (
        <PsGrievancesView
          items={items}
          total={total}
          constants={constants}
          filters={filters}
          basePath="/ps/disposed-grievances"
          detailHrefPrefix="/ps/grievance/"
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          showHeader={false}
          listMode="disposed"
          exportPath="/api/ps/grievances/export-sheet"
          title="Disposed Grievances"
        />
      )}
    </>
  );
}
