import { redirect } from "next/navigation";

import { DepartmentManagementPanel } from "@/components/departments/DepartmentManagementPanel";
import { OsdLayout } from "@/components/layout/OsdLayout";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OsdDepartmentsPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/departments`);
  }

  return (
    <OsdLayout osdSlug={slug} breadcrumb="Departments">
      <DepartmentManagementPanel osdSlug={slug} />
    </OsdLayout>
  );
}
