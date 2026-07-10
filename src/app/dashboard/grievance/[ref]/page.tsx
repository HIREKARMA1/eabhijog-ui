import { PortalLayout } from "@/components/layout/PortalLayout";
import { PortalGrievanceDetail } from "@/components/grievance/PortalGrievanceDetail";
import { getPortalGrievanceDetail } from "@/lib/api/server-portal";

type PageProps = { params: Promise<{ ref: string }> };

export default async function GrievanceDetailPage({ params }: PageProps) {
  const { ref } = await params;
  const data = await getPortalGrievanceDetail(ref);

  return (
    <PortalLayout breadcrumb={ref}>
      <PortalGrievanceDetail
        grievance={data.grievance}
        allowedStatuses={data.allowed_statuses}
        journey={data.journey ?? []}
      />
    </PortalLayout>
  );
}
