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
    { labelKey: "osdSummary.assignedToday", value: data.summary.assigned_today ?? 0 },
    { labelKey: "osdSummary.pendingAck", value: data.summary.pending_acknowledgement ?? data.summary.pending ?? 0 },
    { labelKey: "osdSummary.waitingDept", value: data.summary.waiting_for_department ?? data.summary.action_pending ?? 0 },
    { labelKey: "osdSummary.deptResponded", value: data.summary.department_responded ?? 0 },
    { labelKey: "osdSummary.citizenWaiting", value: data.summary.citizen_waiting ?? 0 },
    { labelKey: "osdSummary.resolvedToday", value: data.summary.resolved_today ?? 0 },
    { labelKey: "osdSummary.overdue", value: data.summary.overdue_cases ?? 0 },
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
