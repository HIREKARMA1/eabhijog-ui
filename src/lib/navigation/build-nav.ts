import type { IconName } from "@/components/icons/Icon";
import {
  isPortalAdmin,
  isPrivateSecretary,
  isStaffManager,
  isSuperAdmin,
  isTransportIntelligenceOfficer,
} from "@/lib/auth/roles";
import type { AuthStaff } from "@/types/api";
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

  if (isPortalAdmin(staff)) {
    items.push({
      href: "/ps/intelligence",
      labelKey: "ps.nav.intelligence",
      icon: "reports",
      section: "nav.operational",
    });
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
  if (osdSlug === "commerce-transport") {
    items.push({
      href: "/ps/intelligence",
      labelKey: "ps.nav.intelligence",
      icon: "reports",
    });
  }
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
    // Press Intelligence nav hidden for now — routes still exist; re-enable via
    // ...buildIntelligenceNavItems() when ready to show again.
    { href: "/ps/taxonomy", labelKey: "ps.nav.taxonomy", icon: "departments" },
    { href: "/ps/osd", labelKey: "ps.nav.osd", icon: "staff" },
  ];
}

function buildIntelligenceNavItems(): NavItem[] {
  return [
    { href: "/ps/intelligence", labelKey: "ps.nav.intelligence", icon: "reports" },
    { href: "/ps/intelligence/candidates", labelKey: "ps.nav.intelligenceQueue", icon: "grievances" },
    { href: "/ps/intelligence/incidents", labelKey: "ps.nav.intelligenceIncidents", icon: "departments" },
    { href: "/ps/intelligence/analytics", labelKey: "ps.nav.intelligenceAnalytics", icon: "reports" },
    { href: "/ps/intelligence/jobs", labelKey: "ps.nav.intelligenceJobs", icon: "staff" },
  ];
}

export function intelligenceHomeHref(staff: AuthStaff): string {
  if (staff.role === "osd_commerce_transport") {
    return "/ps/intelligence";
  }
  return "/ps/intelligence";
}

export function buildIntelligenceNav(staff: AuthStaff): NavItem[] {
  if (staff.role === "transport_intelligence_officer") {
    return buildIntelligenceNavItems();
  }
  if (staff.role === "osd_commerce_transport") {
    return [
      { href: "/ps/intelligence", labelKey: "ps.nav.intelligence", icon: "reports" },
      { href: "/ps/intelligence/candidates", labelKey: "ps.nav.intelligenceQueue", icon: "grievances" },
      { href: "/ps/intelligence/incidents", labelKey: "ps.nav.intelligenceIncidents", icon: "departments" },
      { href: "/ps/intelligence/analytics", labelKey: "ps.nav.intelligenceAnalytics", icon: "reports" },
    ];
  }
  if (isPortalAdmin(staff)) {
    return buildIntelligenceNavItems();
  }
  return buildIntelligenceNavItems();
}

export function buildNavForIntelligencePage(staff: AuthStaff): NavItem[] {
  if (isPrivateSecretary(staff)) {
    return buildPsNav();
  }
  return buildIntelligenceNav(staff);
}

export function buildNavForStaff(
  staff: AuthStaff,
  opts: { pendingCount?: number; osdSlugs?: Record<string, string> } = {},
): NavItem[] {
  const { pendingCount = 0, osdSlugs = {} } = opts;

  if (isPortalAdmin(staff)) {
    return buildPortalNav(staff, pendingCount, osdSlugs);
  }
  if (isPrivateSecretary(staff)) {
    return buildPsNav();
  }
  if (isTransportIntelligenceOfficer(staff)) {
    return buildIntelligenceNav(staff);
  }
  return buildOsdNav(staff.dashboard_slug, pendingCount, staff);
}
