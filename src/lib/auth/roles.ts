import type { AuthStaff } from "@/types/api";

const PORTAL_ADMIN_ROLES = new Set(["super_admin", "admin"]);
const PS_ROLES = new Set(["private_secretary"]);
const OSD_ROLES = new Set([
  "osd_commerce_transport",
  "osd_steel_mines",
  "osd_ganjam_district",
]);
const STAFF_MANAGER_ROLES = PORTAL_ADMIN_ROLES;

export function isPrivateSecretary(staff: AuthStaff): boolean {
  return PS_ROLES.has(staff.role);
}

export function isPortalAdmin(staff: AuthStaff): boolean {
  return PORTAL_ADMIN_ROLES.has(staff.role);
}

export function isSuperAdmin(staff: AuthStaff): boolean {
  return staff.role === "super_admin";
}

export function isStaffManager(staff: AuthStaff): boolean {
  return STAFF_MANAGER_ROLES.has(staff.role);
}

export function isOsdRole(role: string): boolean {
  return OSD_ROLES.has(role);
}

export function formatStaffRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function homePathFor(staff: AuthStaff): string {
  if (isPortalAdmin(staff)) return "/dashboard";
  if (isPrivateSecretary(staff)) return "/ps/dashboard";
  return `/osd/${staff.dashboard_slug}/dashboard`;
}
