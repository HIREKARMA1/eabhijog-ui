import { notFound } from "next/navigation";

import { HearingPublicDetailView } from "@/components/hearing/HearingPublicDetailView";
import { fetchPublicHearing } from "@/lib/api/hearing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function HearingPublicDetailPage({ params }: Props) {
  const { id } = await params;
  const hearingId = Number(id);
  if (!Number.isFinite(hearingId)) notFound();

  try {
    const res = await fetchPublicHearing(hearingId, true);
    return <HearingPublicDetailView hearing={res.data} />;
  } catch {
    notFound();
  }
}
