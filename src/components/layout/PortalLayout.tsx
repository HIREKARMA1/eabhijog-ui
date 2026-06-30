import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { LegacyStyles } from "@/components/legacy/LegacyStyles";
import { buildPortalNav } from "@/lib/navigation/build-nav";
import { getConstants, getCurrentUser, getPortalDashboard } from "@/lib/api/server-portal";
import { homePathFor, isPortalAdmin } from "@/lib/auth/roles";

export async function PortalLayout({
  children,
  breadcrumb,
  bodyClass = "portal-overview-page",
  extraCss = ["portal-overview.css"],
}: {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
  bodyClass?: string;
  extraCss?: string[];
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
    <>
      <LegacyStyles sheets={["app.css", "lang-toggle.css", ...extraCss]} />
      <AppShell
        staff={staff}
        homeHref="/dashboard"
        nav={nav}
        breadcrumb={breadcrumb}
        bodyClass={bodyClass}
      >
        {children}
      </AppShell>
    </>
  );
}
