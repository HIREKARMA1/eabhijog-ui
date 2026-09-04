import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsConversationPanel } from "@/components/ps/PsConversationPanel";
import { getPsConversation } from "@/lib/api/server-portal";

type PageProps = { params: Promise<{ ref: string }> };

export default async function PsGrievanceDetailPage({ params }: PageProps) {
  const { ref } = await params;
  try {
    const data = await getPsConversation(ref.toUpperCase());
    return (
      <>
        <SetBreadcrumb>
          <strong>{data.reference_number}</strong>
        </SetBreadcrumb>
        <PsConversationPanel data={data} />
      </>
    );
  } catch {
    return (
      <>
        <SetBreadcrumb>
          <strong>{ref}</strong>
        </SetBreadcrumb>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Could not load this grievance. Refresh the page or go back to the grievances list.
        </p>
      </>
    );
  }
}
