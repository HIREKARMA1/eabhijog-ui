import { PageLoader } from "@/components/ui/Spinner";

/** Content-area only — shell (sidebar/nav) stays from layout.tsx. */
export default function Loading() {
  return <PageLoader label="Loading…" className="min-h-[50vh]" />;
}
