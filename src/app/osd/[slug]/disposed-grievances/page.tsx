import { redirect } from "next/navigation";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsGrievancesView } from "@/components/ps/PsGrievancesView";
import { getConstants, getOsdDashboard, getCurrentUser } from "@/lib/api/server-portal";
import { serverApiRequest } from "@/lib/api/server";
import { isSuperAdmin } from "@/lib/auth/roles";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";
import type { MetadataConstants, OsdDashboardData, PsGrievanceRow } from "@/types/api";

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
  const basePath = `/osd/${slug}/disposed-grievances`;

  let items: PsGrievanceRow[] = [];
  let total = 0;
  let constants: MetadataConstants | null = null;
  let volumeSummary: OsdDashboardData["summary"] | undefined;
  let superAdmin = false;
  let loadError = false;
  try {
    const [grievancesRes, constantsRes, dashboard, staff] = await Promise.all([
      serverApiRequest<{ items: PsGrievanceRow[]; total: number }>(path),
      getConstants(),
      getOsdDashboard(slug, filters.osd_category, filters.filing_source).catch(() => null),
      getCurrentUser(),
    ]);
    items = grievancesRes.data.items;
    total = grievancesRes.data.total;
    constants = constantsRes;
    volumeSummary = dashboard?.summary;
    superAdmin = isSuperAdmin(staff);
  } catch {
    loadError = true;
  }

  return (
    <>
      <SetBreadcrumb>
        <strong>Disposed Grievances</strong>
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
          basePath={basePath}
          detailHrefPrefix={`/osd/${slug}/grievance/`}
          showHeader={false}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          listMode="disposed"
          exportPath={`/api/osd/${slug}/grievances/export-sheet`}
          title="Disposed Grievances"
          osdSlug={slug}
          volumeSummary={volumeSummary}
          isSuperAdmin={superAdmin}
        />
      )}
    </>
  );
}
