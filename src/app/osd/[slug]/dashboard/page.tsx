import { redirect } from "next/navigation";

import { OsdLayout } from "@/components/layout/OsdLayout";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { getOsdDashboard } from "@/lib/api/server-portal";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";

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
    redirect("/login");
  }

  const kpis = [
    { labelKey: "osdSummary.pending", value: data.summary.pending ?? 0 },
    { labelKey: "osdSummary.forwarded", value: data.summary.forwarded_today ?? 0 },
    { labelKey: "osdSummary.actionPending", value: data.summary.action_pending ?? 0 },
    { labelKey: "osdSummary.closed", value: data.summary.closed ?? 0 },
  ];

  return (
    <OsdLayout osdSlug={slug} breadcrumb={data.osd_category}>
      <div className="space-y-4">
        <p className="text-sm text-text-muted">{data.osd_category}</p>
        <KpiGrid items={kpis} />
      </div>
    </OsdLayout>
  );
}
