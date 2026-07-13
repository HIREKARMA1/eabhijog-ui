import { IntelligenceLayout } from "@/components/layout/IntelligenceLayout";
import { PsIntelligenceDashboard } from "@/components/ps/intelligence/PsIntelligenceDashboard";

export default function PsIntelligencePage() {
  return (
    <IntelligenceLayout breadcrumb={<strong>Press Intelligence</strong>}>
      <PsIntelligenceDashboard />
    </IntelligenceLayout>
  );
}
