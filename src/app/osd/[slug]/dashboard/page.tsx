import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { OsdDashboardOverview } from "@/components/osd/OsdDashboardOverview";
import { getOsdDashboard } from "@/lib/api/server-portal";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function OsdDashboardPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/dashboard`);
  }

  let data;
  try {
    data = await getOsdDashboard(slug);
  } catch {
    redirect("/login");
  }

  return (
    <>
      <SetBreadcrumb>
        <strong>{data.osd_category}</strong>
      </SetBreadcrumb>
      <OsdDashboardOverview data={data} osdSlug={slug} />
    </>
  );
}
