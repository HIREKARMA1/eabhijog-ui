import { PsLayout } from "@/components/layout/PsLayout";

/** Persist PS desk shell across navigations so only the content area reloads. */
export default function PsDeskLayout({ children }: { children: React.ReactNode }) {
  return <PsLayout>{children}</PsLayout>;
}
