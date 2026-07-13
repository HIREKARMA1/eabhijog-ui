import { IntelligenceLayout } from "@/components/layout/IntelligenceLayout";
import { PsIntelligenceJobs } from "@/components/ps/intelligence/PsIntelligenceJobs";

export default function PsIntelligenceJobsPage() {
  return (
    <IntelligenceLayout breadcrumb={<strong>Jobs</strong>}>
      <PsIntelligenceJobs />
    </IntelligenceLayout>
  );
}
