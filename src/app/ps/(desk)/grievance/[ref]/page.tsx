import { redirect } from "next/navigation";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
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
    <>
      <SetBreadcrumb>
        <strong>{data.reference_number}</strong>
      </SetBreadcrumb>
      <PsConversationPanel data={data} />
    </>
  );
}
