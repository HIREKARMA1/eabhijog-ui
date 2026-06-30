import { redirect } from "next/navigation";
import { Suspense } from "react";

import { GrievanceFilters } from "@/components/grievance/GrievanceFilters";
import { GrievanceTable } from "@/components/grievance/GrievanceTable";
import { OsdLayout } from "@/components/layout/OsdLayout";
import { Card } from "@/components/ui/Card";
import { getConstants } from "@/lib/api/server-portal";
import { serverApiRequest } from "@/lib/api/server";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";
import type { GrievanceRow } from "@/types/api";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OsdGrievancesPage({ params, searchParams }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/grievances`);
  }

  const query = await searchParams;
  const qs = new URLSearchParams();
  if (query.status) qs.set("status", query.status);
  if (query.district) qs.set("district", query.district);
  if (query.search) qs.set("search_reference", query.search);

  const path = qs.toString()
    ? `/api/osd/${slug}/grievances?${qs.toString()}`
    : `/api/osd/${slug}/grievances`;

  let grievancesRes;
  let constants;
  try {
    [grievancesRes, constants] = await Promise.all([
      serverApiRequest<GrievanceRow[]>(path),
      getConstants(),
    ]);
  } catch {
    redirect("/login");
  }

  return (
    <OsdLayout osdSlug={slug} breadcrumb="Grievances">
      <div className="space-y-5">
        <Suspense fallback={null}>
          <GrievanceFilters
            statuses={constants.osd_workflow_statuses}
            districts={constants.districts}
            basePath={`/osd/${slug}/grievances`}
          />
        </Suspense>
        <Card>
          <GrievanceTable
            rows={grievancesRes.data}
            detailHrefPrefix={`/osd/${slug}/grievance/`}
          />
        </Card>
      </div>
    </OsdLayout>
  );
}
