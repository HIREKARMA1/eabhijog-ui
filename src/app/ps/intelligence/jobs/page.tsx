import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsIntelligenceJobs } from "@/components/ps/intelligence/PsIntelligenceJobs";

export default function PsIntelligenceJobsPage() {
  return (
    <>
      <SetBreadcrumb>
        <strong>Jobs</strong>
      </SetBreadcrumb>
      <PsIntelligenceJobs />
    </>
  );
}
