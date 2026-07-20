import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsIntelligenceIncidents } from "@/components/ps/intelligence/PsIntelligenceIncidents";

export default function PsIntelligenceIncidentsPage() {
  return (
    <>
      <SetBreadcrumb>
        <strong>Incidents</strong>
      </SetBreadcrumb>
      <PsIntelligenceIncidents />
    </>
  );
}
