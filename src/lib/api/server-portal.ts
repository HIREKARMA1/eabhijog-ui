import { cache } from "react";

import { isMockDataMode } from "@/config/env";
import { getMockPsDashboard } from "@/lib/data/mock-loader";
import { serverApiRequest } from "@/lib/api/server";
import type {
  AuthStaff,
  GrievanceConversationData,
  MetadataConstants,
  OsdDashboardData,
  OsdGrievanceDetailData,
  PortalAnalyticsData,
  PortalDashboardData,
  PortalGrievanceDetailData,
  PortalOperationalData,
  PortalPublicData,
  PsDashboardData,
  StaffAccount,
} from "@/types/api";

/** Deduplicate /api/auth/me within a single RSC request (layout + page). */
export const getCurrentUser = cache(async () => {
  const result = await serverApiRequest<AuthStaff>("/api/auth/me");
  return result.data;
});

export const getOsdDashboard = cache(async (slug: string) => {
  const result = await serverApiRequest<OsdDashboardData>(`/api/osd/${slug}/dashboard`);
  return result.data;
});

export async function getPublicPortal() {
  const result = await serverApiRequest<PortalPublicData>("/api/public/portal");
  return result.data;
}

export async function getPortalDashboard() {
  const result = await serverApiRequest<PortalDashboardData>("/api/portal/dashboard");
  return result.data;
}

export async function getPortalOperational(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/portal/operational?${qs}` : "/api/portal/operational";
  const result = await serverApiRequest<PortalOperationalData>(path);
  return result.data;
}

export async function getPortalGrievanceDetail(ref: string) {
  const result = await serverApiRequest<PortalGrievanceDetailData>(
    `/api/portal/grievances/${encodeURIComponent(ref)}`,
  );
  return result.data;
}

export async function getPortalAnalytics() {
  const result = await serverApiRequest<PortalAnalyticsData>("/api/portal/analytics");
  return result.data;
}

export async function getConstants() {
  const result = await serverApiRequest<MetadataConstants>("/api/metadata/constants");
  return result.data;
}

export async function getOsdGrievanceDetail(slug: string, ref: string) {
  const result = await serverApiRequest<OsdGrievanceDetailData>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}`,
  );
  return result.data;
}

export async function getProfile() {
  const result = await serverApiRequest<StaffAccount>("/api/profile");
  return result.data;
}

export async function getPsDashboard() {
  if (isMockDataMode()) {
    return getMockPsDashboard();
  }
  const result = await serverApiRequest<PsDashboardData>("/api/ps/dashboard");
  return result.data;
}

export async function getPsConversation(ref: string) {
  const result = await serverApiRequest<GrievanceConversationData>(
    `/api/ps/grievances/${encodeURIComponent(ref)}/conversation`,
  );
  return result.data;
}

export async function getOsdConversation(slug: string, ref: string) {
  const result = await serverApiRequest<GrievanceConversationData>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/conversation`,
  );
  return result.data;
}
