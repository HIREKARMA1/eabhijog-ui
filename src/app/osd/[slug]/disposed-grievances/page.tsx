import { redirect } from "next/navigation";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsGrievancesView } from "@/components/ps/PsGrievancesView";
import { getConstants } from "@/lib/api/server-portal";
import { serverApiRequest } from "@/lib/api/server";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";
import type { PsGrievanceRow } from "@/types/api";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};
const PAGE_SIZE = 10;
const DEFAULT_STATUS = "disposed_grievances";

export default async function OsdDisposedGrievancesPage({ params, searchParams }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/disposed-grievances`);
  }

  const query = await searchParams;
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value) filters[key] = value;
  }
  if (!filters.status) filters.status = DEFAULT_STATUS;

  const currentPage = Math.max(1, Number(filters.page || "1") || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const requestFilters = new URLSearchParams(filters);
  requestFilters.set("limit", String(PAGE_SIZE));
  requestFilters.set("offset", String(offset));
  const qs = requestFilters.toString();
  const path = `/api/osd/${slug}/grievances?${qs}`;

  let grievancesRes;
  let constants;
  try {
    [grievancesRes, constants] = await Promise.all([
      serverApiRequest<{ items: PsGrievanceRow[]; total: number }>(path),
      getConstants(),
    ]);
  } catch {
    redirect("/login");
  }

  const { items, total } = grievancesRes.data;
  const basePath = `/osd/${slug}/disposed-grievances`;

  return (
    <>
      <SetBreadcrumb>
        <strong>Disposed Grievances</strong>
      </SetBreadcrumb>
      <PsGrievancesView
        items={items}
        total={total}
        constants={constants}
        filters={filters}
        basePath={basePath}
        detailHrefPrefix={`/osd/${slug}/grievance/`}
        showHeader={false}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        listMode="disposed"
        title="Disposed Grievances"
      />
    </>
  );
}
