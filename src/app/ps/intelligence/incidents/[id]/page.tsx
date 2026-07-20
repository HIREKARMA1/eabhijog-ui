import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsIntelligenceIncidentDetail } from "@/components/ps/intelligence/PsIntelligenceIncidentDetail";

export default async function PsIntelligenceIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SetBreadcrumb>
        <strong>Incident #{id}</strong>
      </SetBreadcrumb>
      <PsIntelligenceIncidentDetail id={Number(id)} />
    </>
  );
}
