import { redirect } from "next/navigation";

import { OsdLayout } from "@/components/layout/OsdLayout";
import { OsdGrievanceDetailView } from "@/components/grievance/OsdGrievanceDetail";
import { getConstants, getOsdGrievanceDetail } from "@/lib/api/server-portal";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";

type PageProps = { params: Promise<{ slug: string; ref: string }> };

export default async function OsdGrievanceDetailPage({ params }: PageProps) {
  const { slug: rawSlug, ref } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/grievance/${encodeURIComponent(ref)}`);
  }

  let data;
  let constants;
  try {
    [data, constants] = await Promise.all([
      getOsdGrievanceDetail(slug, ref),
      getConstants(),
    ]);
  } catch {
    redirect("/login");
  }

  return (
    <OsdLayout osdSlug={slug} breadcrumb={ref}>
      <OsdGrievanceDetailView
        osdSlug={slug}
        grievance={data.grievance}
        allowedStatuses={data.allowed_statuses}
        priorities={constants.priorities}
        suggestedRecipients={data.suggested_recipients}
        journey={data.journey ?? []}
      />
    </OsdLayout>
  );
}
