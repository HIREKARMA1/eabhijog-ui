import { redirect } from "next/navigation";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { DepartmentManagementPanel } from "@/components/departments/DepartmentManagementPanel";
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
    <>
      <SetBreadcrumb>
        <strong>Departments</strong>
      </SetBreadcrumb>
      <DepartmentManagementPanel osdSlug={slug} />
    </>
  );
}
