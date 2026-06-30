import type { AuthStaff } from "@/types/api";

const PORTAL_ADMIN_ROLES = new Set(["super_admin", "admin"]);
const STAFF_MANAGER_ROLES = PORTAL_ADMIN_ROLES;

export function isPortalAdmin(staff: AuthStaff): boolean {
  return PORTAL_ADMIN_ROLES.has(staff.role);
}

export function isSuperAdmin(staff: AuthStaff): boolean {
  return staff.role === "super_admin";
}

export function isStaffManager(staff: AuthStaff): boolean {
  return STAFF_MANAGER_ROLES.has(staff.role);
}

export function homePathFor(staff: AuthStaff): string {
  if (isPortalAdmin(staff)) return "/dashboard";
  return `/osd/${staff.dashboard_slug}/dashboard`;
}
