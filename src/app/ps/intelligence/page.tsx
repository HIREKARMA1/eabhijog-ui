import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsIntelligenceDashboard } from "@/components/ps/intelligence/PsIntelligenceDashboard";

export default function PsIntelligencePage() {
  return (
    <>
      <SetBreadcrumb>
        <strong>Press Intelligence</strong>
      </SetBreadcrumb>
      <PsIntelligenceDashboard />
    </>
  );
}
