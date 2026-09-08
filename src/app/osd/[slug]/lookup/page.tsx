import { redirect } from "next/navigation";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { OsdGrievanceJourneyLookup } from "@/components/grievance/OsdGrievanceJourneyLookup";
import { getConstants } from "@/lib/api/server-portal";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";

type PageProps = { params: Promise<{ slug: string }> };

export default async function OsdGrievanceLookupPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/lookup`);
  }

  try {
    const constants = await getConstants();
    return (
      <>
        <SetBreadcrumb>
          <strong>Grievance lookup</strong>
        </SetBreadcrumb>
        <OsdGrievanceJourneyLookup osdSlug={slug} osdCategories={constants.osd_categories} />
      </>
    );
  } catch {
    return (
      <>
        <SetBreadcrumb>
          <strong>Grievance lookup</strong>
        </SetBreadcrumb>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Could not load grievance lookup. Refresh the page after the API is available.
        </p>
      </>
    );
  }
}
