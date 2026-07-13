import { IntelligenceLayout } from "@/components/layout/IntelligenceLayout";
import { PsIntelligenceCandidateDetail } from "@/components/ps/intelligence/PsIntelligenceCandidateDetail";

export default async function PsIntelligenceCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const num = Number(id);
  return (
    <IntelligenceLayout breadcrumb={<strong>Candidate #{id}</strong>}>
      <PsIntelligenceCandidateDetail id={num} />
    </IntelligenceLayout>
  );
}
