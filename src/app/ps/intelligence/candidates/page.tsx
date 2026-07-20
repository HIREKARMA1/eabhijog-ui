import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsIntelligenceCandidatesView } from "@/components/ps/intelligence/PsIntelligenceCandidatesView";

export default function PsIntelligenceCandidatesPage() {
  return (
    <>
      <SetBreadcrumb>
        <strong>Review queue</strong>
      </SetBreadcrumb>
      <PsIntelligenceCandidatesView />
    </>
  );
}
