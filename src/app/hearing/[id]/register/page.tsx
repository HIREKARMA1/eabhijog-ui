import { notFound } from "next/navigation";

import { HearingRegistrationForm } from "@/components/hearing/HearingRegistrationForm";
import { fetchPublicHearing } from "@/lib/api/hearing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function HearingRegisterPage({ params }: Props) {
  const { id } = await params;
  const hearingId = Number(id);
  if (!Number.isFinite(hearingId)) notFound();

  try {
    const res = await fetchPublicHearing(hearingId, true);
    return <HearingRegistrationForm hearing={res.data} />;
  } catch {
    notFound();
  }
}
