import type { PortalPublicData, PortalStats } from "@/types/api";

const ODISHA_DISTRICT_COUNT = 30;
const OSD_CATEGORY_COUNT = 3;

function formatCount(value: number): string {
  return value.toLocaleString("en-IN");
}

/** Mirrors server `portal_stats_to_display` for landing/auth templates. */
export function portalStatsToDisplay(portal: PortalPublicData | null): Record<string, string> {
  if (!portal) {
    return {
      grievances_30d: "0",
      resolved_on_time: "—",
      median_reply: "—",
      resolution_rate: "0",
      district_count: String(ODISHA_DISTRICT_COUNT),
      active_district_count: "0",
      closed_count: "0",
      resolution_rate_pct: "0",
      preview_overdue: "0",
      preview_active: "0",
      preview_resolved: "0",
      preview_wa_active: "0",
      avg_resolution_display: "—",
      total_grievances: "0",
      onboarded_categories: String(OSD_CATEGORY_COUNT),
    };
  }

  const s = portal.stats as PortalStats & {
    active_district_count?: number;
    sla_breached_open?: number;
    whatsapp_sessions_7d?: number;
    grievances_30d?: number;
    onboarded_categories?: number;
    resolution_rate_pct?: number;
  };

  return {
    grievances_30d: formatCount(s.grievances_30d ?? 0),
    resolved_on_time: s.resolved_on_time_display,
    median_reply: s.median_reply_display,
    resolution_rate: s.resolution_rate_display.replace("%", ""),
    district_count: String(s.district_count),
    active_district_count: String(s.active_district_count ?? 0),
    closed_count: String(s.closed_count),
    resolution_rate_pct: String(Math.round(s.resolution_rate_pct ?? 0)),
    preview_overdue: formatCount(s.sla_breached_open ?? 0),
    preview_active: formatCount(s.open_count),
    preview_resolved: formatCount(s.closed_count),
    preview_wa_active: formatCount(s.whatsapp_sessions_7d ?? 0),
    avg_resolution_display: s.median_reply_display,
    total_grievances: formatCount(s.total_grievances),
    onboarded_categories: String(s.onboarded_categories ?? OSD_CATEGORY_COUNT),
  };
}
