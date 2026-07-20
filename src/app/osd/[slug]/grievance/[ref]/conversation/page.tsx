import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { OsdConversationPanel } from "@/components/grievance/OsdConversationPanel";
import { getOsdConversation } from "@/lib/api/server-portal";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";

type PageProps = { params: Promise<{ slug: string; ref: string }> };

export default async function OsdGrievanceConversationPage({ params }: PageProps) {
  const { slug: rawSlug, ref } = await params;
  const slug = normalizeOsdSlug(rawSlug);
  const data = await getOsdConversation(slug, ref.toUpperCase());

  return (
    <>
      <SetBreadcrumb>
        <strong>{data.reference_number}</strong>
      </SetBreadcrumb>
      <OsdConversationPanel data={data} osdSlug={slug} />
    </>
  );
}
