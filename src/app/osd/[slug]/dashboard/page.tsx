import { OsdDashboardOverview } from "@/components/osd/OsdDashboardOverview";
import { getOsdDashboard } from "@/lib/api/server-portal";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";
import { redirect } from "next/navigation";
import type { OsdDashboardData } from "@/types/api";

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
  const filingSource = query.filing_source;
  const chart = {
    period: query.chart_period,
    from: query.chart_from,
    to: query.chart_to,
  };

  let data: OsdDashboardData | null = null;
  try {
    data = await getOsdDashboard(slug, undefined, filingSource, chart);
  } catch {
    // Auth is enforced in OsdLayout. Do not bounce to /login here — that fights
    // LoginAuthGuard and creates a redirect loop when the dashboard API fails.
  }

  if (!data) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Could not load the OSD dashboard. Refresh the page or open Grievances from the sidebar.
      </p>
    );
  }

  return <OsdDashboardOverview data={data} />;
}
