import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { LegacyStyles } from "@/components/legacy/LegacyStyles";
import { getCurrentUser, getOsdDashboard } from "@/lib/api/server-portal";
import { buildOsdNav } from "@/lib/navigation/build-nav";
import { homePathFor } from "@/lib/auth/roles";

export async function OsdLayout({
  osdSlug,
  children,
  breadcrumb,
  extraCss = ["osd-dashboard.css"],
}: {
  osdSlug: string;
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
  extraCss?: string[];
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
    <>
      <LegacyStyles sheets={["app.css", "lang-toggle.css", ...extraCss]} />
      <AppShell
        staff={staff}
        homeHref={`/osd/${osdSlug}/dashboard`}
        nav={nav}
        breadcrumb={breadcrumb}
        bodyClass="osd-dashboard-page"
      >
        {children}
      </AppShell>
    </>
  );
}
