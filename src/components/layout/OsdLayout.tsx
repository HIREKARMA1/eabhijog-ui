import { redirect } from "next/navigation";

import { PortalShell } from "@/components/shell/PortalShell";
import { getCurrentUser, getOsdDashboard } from "@/lib/api/server-portal";
import { buildOsdNav } from "@/lib/navigation/build-nav";
import { homePathFor } from "@/lib/auth/roles";

export async function OsdLayout({
  osdSlug,
  children,
  breadcrumb,
}: {
  osdSlug: string;
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  let staff;
  let osd;

  try {
    [staff, osd] = await Promise.all([getCurrentUser(), getOsdDashboard(osdSlug)]);
  } catch {
    redirect("/login");
  }

  if (staff.dashboard_slug !== osdSlug && staff.role !== "super_admin") {
    redirect(homePathFor(staff));
  }

  const nav = buildOsdNav(osdSlug, osd.pending_count, staff);

  return (
    <PortalShell
      staff={staff}
      homeHref={`/osd/${osdSlug}/dashboard`}
      nav={nav}
      breadcrumb={breadcrumb}
    >
      {children}
    </PortalShell>
  );
}
