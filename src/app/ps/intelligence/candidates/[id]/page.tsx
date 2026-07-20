import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsIntelligenceCandidateDetail } from "@/components/ps/intelligence/PsIntelligenceCandidateDetail";

export default async function PsIntelligenceCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const num = Number(id);
  return (
    <>
      <SetBreadcrumb>
        <strong>Candidate #{id}</strong>
      </SetBreadcrumb>
      <PsIntelligenceCandidateDetail id={num} />
    </>
  );
}
