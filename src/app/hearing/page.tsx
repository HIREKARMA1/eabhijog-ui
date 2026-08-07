import { HearingListView } from "@/components/hearing/HearingListView";
import { fetchPublicHearings } from "@/lib/api/hearing";
import type { HearingPublicSummary } from "@/types/api";

export const dynamic = "force-dynamic";

export default async function HearingListPage() {
  let hearings: HearingPublicSummary[] = [];
  try {
    const res = await fetchPublicHearings(true);
    hearings = res.data;
  } catch {
    hearings = [];
  }

  return <HearingListView hearings={hearings} />;
}
