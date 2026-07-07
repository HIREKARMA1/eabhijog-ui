export const OSD_DESK_OPTIONS = [
  {
    role: "osd_commerce_transport",
    category: "Commerce & Transport",
    slug: "commerce-transport",
  },
  {
    role: "osd_steel_mines",
    category: "Steel & Mines",
    slug: "steel-mines",
  },
  {
    role: "osd_ganjam_district",
    category: "Ganjam District",
    slug: "ganjam-district",
  },
] as const;

export type OsdDeskRole = (typeof OSD_DESK_OPTIONS)[number]["role"];

export function osdCategoryForRole(role: string): string | undefined {
  return OSD_DESK_OPTIONS.find((desk) => desk.role === role)?.category;
}

export function osdRoleLabel(role: string): string {
  return osdCategoryForRole(role) ?? role.replace(/_/g, " ");
}
