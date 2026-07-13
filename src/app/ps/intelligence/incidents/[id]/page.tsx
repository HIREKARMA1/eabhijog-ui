import { IntelligenceLayout } from "@/components/layout/IntelligenceLayout";
import { PsIntelligenceIncidentDetail } from "@/components/ps/intelligence/PsIntelligenceIncidentDetail";

export default async function PsIntelligenceIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <IntelligenceLayout breadcrumb={<strong>Incident #{id}</strong>}>
      <PsIntelligenceIncidentDetail id={Number(id)} />
    </IntelligenceLayout>
  );
}
