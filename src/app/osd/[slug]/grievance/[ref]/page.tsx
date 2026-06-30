import { OsdLayout } from "@/components/layout/OsdLayout";
import { OsdGrievanceDetailView } from "@/components/grievance/OsdGrievanceDetail";
import { getConstants, getOsdGrievanceDetail } from "@/lib/api/server-portal";

type PageProps = { params: Promise<{ slug: string; ref: string }> };

export default async function OsdGrievanceDetailPage({ params }: PageProps) {
  const { slug, ref } = await params;
  const [data, constants] = await Promise.all([
    getOsdGrievanceDetail(slug, ref),
    getConstants(),
  ]);

  return (
    <OsdLayout osdSlug={slug} breadcrumb={ref}>
      <OsdGrievanceDetailView
        osdSlug={slug}
        grievance={data.grievance}
        allowedStatuses={data.allowed_statuses}
        priorities={constants.priorities}
        suggestedRecipients={data.suggested_recipients}
        timeline={data.timeline}
      />
    </OsdLayout>
  );
}
