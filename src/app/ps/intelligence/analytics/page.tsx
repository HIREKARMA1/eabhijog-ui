import { IntelligenceLayout } from "@/components/layout/IntelligenceLayout";
import { PsIntelligenceAnalytics } from "@/components/ps/intelligence/PsIntelligenceAnalytics";

export default function PsIntelligenceAnalyticsPage() {
  return (
    <IntelligenceLayout breadcrumb={<strong>Analytics</strong>}>
      <PsIntelligenceAnalytics />
    </IntelligenceLayout>
  );
}
