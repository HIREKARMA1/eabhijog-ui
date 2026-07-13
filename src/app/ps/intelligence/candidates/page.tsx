import { IntelligenceLayout } from "@/components/layout/IntelligenceLayout";
import { PsIntelligenceCandidatesView } from "@/components/ps/intelligence/PsIntelligenceCandidatesView";

export default function PsIntelligenceCandidatesPage() {
  return (
    <IntelligenceLayout breadcrumb={<strong>Review queue</strong>}>
      <PsIntelligenceCandidatesView />
    </IntelligenceLayout>
  );
}
