import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsIntelligenceAnalytics } from "@/components/ps/intelligence/PsIntelligenceAnalytics";

export default function PsIntelligenceAnalyticsPage() {
  return (
    <>
      <SetBreadcrumb>
        <strong>Analytics</strong>
      </SetBreadcrumb>
      <PsIntelligenceAnalytics />
    </>
  );
}
