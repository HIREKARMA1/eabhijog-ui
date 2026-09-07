import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { OsdDashboardOverview } from "@/components/osd/OsdDashboardOverview";
import { getConstants, getCurrentUser, getOsdDashboard } from "@/lib/api/server-portal";
import { isSuperAdmin } from "@/lib/auth/roles";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";
import { redirect } from "next/navigation";
import type { MetadataConstants, OsdDashboardData } from "@/types/api";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OsdDashboardPage({ params, searchParams }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/dashboard`);
  }

  const query = await searchParams;
  const filters: Record<string, string> = {};
  for (const key of ["osd_category", "filing_source"]) {
    const value = query[key];
    if (value) filters[key] = value;
  }

  let data: OsdDashboardData | null = null;
  let constants: MetadataConstants | null = null;
  let superAdmin = false;
  try {
    const [dashboard, constantsRes, staff] = await Promise.all([
      getOsdDashboard(slug, filters.osd_category, filters.filing_source),
      getConstants(),
      getCurrentUser(),
    ]);
    data = dashboard;
    constants = constantsRes;
    superAdmin = isSuperAdmin(staff);
  } catch {
    // Auth is enforced in OsdLayout. Do not bounce to /login here — that fights
    // LoginAuthGuard and creates a redirect loop when the dashboard API fails.
    return (
      <>
        <SetBreadcrumb>
          <strong>OSD</strong>
        </SetBreadcrumb>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Could not load the OSD dashboard. Refresh the page or open Grievances from the sidebar.
        </p>
      </>
    );
  }

  return (
    <>
      <SetBreadcrumb>
        <strong>{data.osd_category}</strong>
      </SetBreadcrumb>
      <OsdDashboardOverview
        data={data}
        osdSlug={slug}
        constants={constants}
        filters={filters}
        isSuperAdmin={superAdmin}
      />
    </>
  );
}
