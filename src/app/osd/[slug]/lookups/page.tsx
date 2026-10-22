import { redirect } from "next/navigation";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { EmployeeLookupsPanel } from "@/components/osd/EmployeeLookupsPanel";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";

type PageProps = { params: Promise<{ slug: string }> };

export default async function EmployeeLookupsPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);
  if (slug !== decodeURIComponent(rawSlug)) redirect(`/osd/${slug}/lookups`);

  return (
    <>
      <SetBreadcrumb><strong>Lookups</strong></SetBreadcrumb>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">Employee Lookups</h1>
        <p className="mt-1 text-sm text-text-muted">Manage employee contact details used to quickly address grievance forwards.</p>
      </div>
      <EmployeeLookupsPanel osdSlug={slug} />
    </>
  );
}
