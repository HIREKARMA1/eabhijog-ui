import type { AuthStaff } from "@/types/api";
import { isPortalAdmin, isStaffManager, isSuperAdmin } from "@/lib/auth/roles";

export type NavItem = {
  href: string;
  labelKey: string;
  icon?: string;
  badge?: number;
  section?: string;
};

export function buildPortalNav(
  staff: AuthStaff,
  pendingCount: number,
  osdSlugs: Record<string, string>,
): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: "📊", section: "nav.main" },
    {
      href: "/dashboard/grievances",
      labelKey: "nav.grievances",
      icon: "📋",
      badge: pendingCount,
    },
    { href: "/dashboard/analytics", labelKey: "nav.reports", icon: "📈" },
  ];

  if (isStaffManager(staff)) {
    items.push({ href: "/dashboard/staff", labelKey: "nav.staff", icon: "👥" });
  }

  if (isSuperAdmin(staff)) {
    Object.entries(osdSlugs).forEach(([, slug]) => {
      items.push({
        href: `/osd/${slug}/dashboard`,
        labelKey: `osd.${slug}`,
        icon: "🏛",
        section: "nav.operational",
      });
    });
  }

  return items;
}

export function buildOsdNav(osdSlug: string, pendingCount: number, staff: AuthStaff): NavItem[] {
  const base = `/osd/${osdSlug}`;
  const items: NavItem[] = [
    {
      href: `${base}/dashboard`,
      labelKey: "nav.operationalCommand",
      icon: "📊",
      section: "nav.osd",
    },
    { href: `${base}/grievances`, labelKey: "nav.grievances", icon: "📋", badge: pendingCount },
    { href: `${base}/departments`, labelKey: "nav.departments", icon: "🏢" },
  ];
  if (isPortalAdmin(staff)) {
    items.push({ href: "/dashboard", labelKey: "nav.superAdmin", icon: "↩" });
  }
  return items;
}

export function buildPsNav(): NavItem[] {
  return [
    { href: "/ps/dashboard", labelKey: "nav.psDashboard", icon: "📊", section: "nav.main" },
    { href: "/ps/grievances", labelKey: "nav.grievances", icon: "📋" },
  ];
}
