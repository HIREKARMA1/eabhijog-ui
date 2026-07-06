import { redirect } from "next/navigation";
import { Suspense } from "react";

import { OsdLayout } from "@/components/layout/OsdLayout";
import { PsGrievancesView } from "@/components/ps/PsGrievancesView";
import { getConstants } from "@/lib/api/server-portal";
import { serverApiRequest } from "@/lib/api/server";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";
import type { PsGrievanceRow } from "@/types/api";

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
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value) filters[key] = value;
  }

  const qs = new URLSearchParams(filters).toString();
  const path = qs
    ? `/api/osd/${slug}/grievances?${qs}`
    : `/api/osd/${slug}/grievances`;

  let grievancesRes;
  let constants;
  try {
    [grievancesRes, constants] = await Promise.all([
      serverApiRequest<{ items: PsGrievanceRow[]; total: number }>(path),
      getConstants(),
    ]);
  } catch {
    redirect("/login");
  }

  const { items, total } = grievancesRes.data;

  return (
    <OsdLayout osdSlug={slug} breadcrumb="Grievances">
      <Suspense fallback={null}>
        <PsGrievancesView
          items={items}
          total={total}
          constants={constants}
          filters={filters}
          basePath={`/osd/${slug}/grievances`}
          detailHrefPrefix={`/osd/${slug}/grievance/`}
          hideOsdCategory
        />
      </Suspense>
    </OsdLayout>
  );
}
