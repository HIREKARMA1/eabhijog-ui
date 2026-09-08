import { redirect } from "next/navigation";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { OsdGrievanceDetailView } from "@/components/grievance/OsdGrievanceDetail";
import { getConstants, getOsdConversation, getOsdGrievanceDetail, getCurrentUser } from "@/lib/api/server-portal";
import { isSuperAdmin } from "@/lib/auth/roles";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";

type PageProps = { params: Promise<{ slug: string; ref: string }> };

export default async function OsdGrievanceDetailPage({ params }: PageProps) {
  const { slug: rawSlug, ref } = await params;
  const slug = normalizeOsdSlug(rawSlug);

  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/osd/${slug}/grievance/${encodeURIComponent(ref)}`);
  }

  try {
    const [data, constants, conversation, staff] = await Promise.all([
      getOsdGrievanceDetail(slug, ref),
      getConstants(),
      getOsdConversation(slug, ref.toUpperCase()).catch(() => null),
      getCurrentUser(),
    ]);
    return (
      <>
        <SetBreadcrumb>
          <strong>{ref}</strong>
        </SetBreadcrumb>
        <OsdGrievanceDetailView
          osdSlug={slug}
          grievance={data.grievance}
          allowedStatuses={data.allowed_statuses}
          priorities={constants.priorities}
          suggestedRecipients={data.suggested_recipients}
          resolvedRecipients={data.resolved_recipients ?? []}
          conversation={conversation}
          isSuperAdmin={isSuperAdmin(staff)}
        />
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
