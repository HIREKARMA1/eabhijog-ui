import { IntelligenceLayout } from "@/components/layout/IntelligenceLayout";
import { PsIntelligenceIncidents } from "@/components/ps/intelligence/PsIntelligenceIncidents";

export default function PsIntelligenceIncidentsPage() {
  return (
    <IntelligenceLayout breadcrumb={<strong>Incidents</strong>}>
      <PsIntelligenceIncidents />
    </IntelligenceLayout>
  );
}
