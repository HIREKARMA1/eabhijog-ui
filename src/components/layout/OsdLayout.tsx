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
  try {
    staff = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  if (staff.dashboard_slug !== osdSlug && staff.role !== "super_admin") {
    redirect(homePathFor(staff));
  }

  let pendingCount = 0;
  try {
    const osd = await getOsdDashboard(osdSlug);
    pendingCount = osd.pending_count;
  } catch {
    // Dashboard fetch failure must not log the user out (avoids login ↔ OSD loop).
    pendingCount = 0;
  }

  const nav = buildOsdNav(osdSlug, pendingCount, staff);

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
