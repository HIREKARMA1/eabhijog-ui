import { redirect } from "next/navigation";

import { PortalShell } from "@/components/shell/PortalShell";
import { buildPortalNav } from "@/lib/navigation/build-nav";
import { getConstants, getCurrentUser, getPortalDashboard } from "@/lib/api/server-portal";
import { homePathFor, isPortalAdmin } from "@/lib/auth/roles";

export async function PortalLayout({
  children,
  breadcrumb,
}: {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  let staff;
  let dashboard;
  let constants;

  try {
    [staff, dashboard, constants] = await Promise.all([
      getCurrentUser(),
      getPortalDashboard(),
      getConstants(),
    ]);
  } catch {
    redirect("/login");
  }

  if (!isPortalAdmin(staff)) {
    redirect(homePathFor(staff));
  }

  const nav = buildPortalNav(staff, dashboard.pending_count, constants.osd_slugs);

  return (
    <PortalShell staff={staff} homeHref="/dashboard" nav={nav} breadcrumb={breadcrumb}>
      {children}
    </PortalShell>
  );
}
