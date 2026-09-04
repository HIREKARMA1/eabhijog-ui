import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { OsdDashboardOverview } from "@/components/osd/OsdDashboardOverview";
import { getOsdDashboard } from "@/lib/api/server-portal";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function OsdDashboardPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/dashboard`);
  }

  let data;
  try {
    data = await getOsdDashboard(slug);
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
      <OsdDashboardOverview data={data} osdSlug={slug} />
    </>
  );
}
