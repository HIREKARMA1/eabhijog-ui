import type { AuthStaff } from "@/types/api";

const PORTAL_ADMIN_ROLES = new Set(["super_admin", "admin"]);
const PS_ROLES = new Set(["private_secretary"]);
const INTELLIGENCE_MANAGE_ROLES = new Set([
  "private_secretary",
  "transport_intelligence_officer",
  "super_admin",
  "admin",
]);
const INTELLIGENCE_READ_ROLES = new Set([
  ...INTELLIGENCE_MANAGE_ROLES,
  "osd_commerce_transport",
]);
const OSD_ROLES = new Set([
  "osd_commerce_transport",
  "osd_steel_mines",
  "osd_ganjam_district",
]);
const STAFF_MANAGER_ROLES = PORTAL_ADMIN_ROLES;

export function isTransportIntelligenceOfficer(staff: AuthStaff): boolean {
  return staff.role === "transport_intelligence_officer";
}

export function canAccessIntelligence(staff: AuthStaff): boolean {
  return INTELLIGENCE_READ_ROLES.has(staff.role);
}

export function canManageIntelligence(staff: AuthStaff): boolean {
  return INTELLIGENCE_MANAGE_ROLES.has(staff.role);
}

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
  if (isTransportIntelligenceOfficer(staff)) return "/ps/intelligence";
  return `/osd/${staff.dashboard_slug}/dashboard`;
}
