import { redirect } from "next/navigation";

import { PsLayout } from "@/components/layout/PsLayout";
import { PsConversationPanel } from "@/components/ps/PsConversationPanel";
import { getPsConversation } from "@/lib/api/server-portal";

type PageProps = { params: Promise<{ ref: string }> };

export default async function PsGrievanceDetailPage({ params }: PageProps) {
  const { ref } = await params;
  let data;
  try {
    data = await getPsConversation(ref.toUpperCase());
  } catch {
    redirect("/login");
  }

  return (
    <PsLayout breadcrumb={<strong>{data.reference_number}</strong>}>
      <PsConversationPanel data={data} />
    </PsLayout>
  );
}
