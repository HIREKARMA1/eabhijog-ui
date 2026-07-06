import type { IconName } from "@/components/icons/Icon";
import type { AuthStaff } from "@/types/api";
import { isPortalAdmin, isStaffManager, isSuperAdmin } from "@/lib/auth/roles";

export type NavItem = {
  href: string;
  labelKey: string;
  icon?: IconName;
  badge?: number;
  section?: string;
};

export function buildPortalNav(
  staff: AuthStaff,
  pendingCount: number,
  osdSlugs: Record<string, string>,
): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: "dashboard", section: "nav.main" },
    {
      href: "/dashboard/grievances",
      labelKey: "nav.grievances",
      icon: "grievances",
      badge: pendingCount,
    },
    { href: "/dashboard/analytics", labelKey: "nav.reports", icon: "reports" },
  ];

  if (isStaffManager(staff)) {
    items.push({ href: "/dashboard/staff", labelKey: "nav.staff", icon: "staff" });
  }

  if (isSuperAdmin(staff)) {
    Object.entries(osdSlugs).forEach(([, slug]) => {
      items.push({
        href: `/osd/${slug}/dashboard`,
        labelKey: `osd.${slug}`,
        icon: "departments",
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
      icon: "dashboard",
      section: "nav.osd",
    },
    {
      href: `${base}/grievances`,
      labelKey: "nav.grievances",
      icon: "grievances",
      badge: pendingCount,
    },
    { href: `${base}/departments`, labelKey: "nav.departments", icon: "departments" },
  ];
  if (isPortalAdmin(staff)) {
    items.push({ href: "/dashboard", labelKey: "nav.superAdmin", icon: "back" });
  }
  return items;
}

export function buildPsNav(): NavItem[] {
  return [
    {
      href: "/ps/dashboard",
      labelKey: "ps.nav.dashboard",
      icon: "dashboard",
      section: "nav.main",
    },
    { href: "/ps/grievances", labelKey: "ps.nav.grievances", icon: "grievances" },
  ];
}
