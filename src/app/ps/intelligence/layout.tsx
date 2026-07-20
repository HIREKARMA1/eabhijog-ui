import { IntelligenceLayout } from "@/components/layout/IntelligenceLayout";

/** Persist Press Intelligence shell across its sub-routes. */
export default function PsIntelligenceSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IntelligenceLayout>{children}</IntelligenceLayout>;
}
