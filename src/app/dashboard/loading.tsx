import { PageLoader } from "@/components/ui/Spinner";

/** Content-area only - shell stays from PortalLayout when present. */
export default function Loading() {
  return <PageLoader label="Loading…" className="min-h-[50vh]" />;
}
