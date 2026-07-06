import { apiRequest } from "@/lib/api/client";
import type {
  AuthLoginData,
  AuthStaff,
  DepartmentActionData,
  DepartmentGrievanceView,
  MetadataConstants,
  OsdDashboardData,
  OsdDepartmentContactRecord,
  OsdGrievanceDetailData,
  PortalAnalyticsData,
  PortalDashboardData,
  PortalGrievanceDetailData,
  PortalOperationalData,
  PortalPublicData,
  StaffAccount,
  StaffListData,
  PsGrievanceRow,
} from "@/types/api";

export async function login(username: string, password: string) {
  return apiRequest<AuthLoginData>("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export async function logout() {
  return apiRequest<null>("/api/auth/logout", { method: "POST" });
}

export async function fetchCurrentUser(server = false) {
  return apiRequest<AuthStaff>("/api/auth/me", { server });
}

export async function forgotPassword(email: string) {
  return apiRequest<null>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(token: string, password: string, passwordConfirm: string) {
  return apiRequest<null>("/api/auth/reset-password", {
    method: "POST",
    body: { token, password, password_confirm: passwordConfirm },
  });
}

export async function requestAccess(payload: Record<string, string>) {
  return apiRequest<null>("/api/auth/request-access", { method: "POST", body: payload });
}

export async function requestDemo(payload: Record<string, string>) {
  return apiRequest<null>("/api/auth/request-demo", { method: "POST", body: payload });
}

export async function fetchProfile() {
  return apiRequest<StaffAccount>("/api/profile");
}

export async function updateProfile(payload: Record<string, unknown>) {
  return apiRequest<StaffAccount>("/api/profile", { method: "PATCH", body: payload });
}

export async function fetchPublicPortal(server = false) {
  return apiRequest<PortalPublicData>("/api/public/portal", { server });
}

export async function fetchPortalDashboard(server = false) {
  return apiRequest<PortalDashboardData>("/api/portal/dashboard", { server });
}

export async function fetchPortalOperational(params: Record<string, string> = {}, server = false) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/portal/operational?${qs}` : "/api/portal/operational";
  return apiRequest<PortalOperationalData>(path, { server });
}

export async function fetchPortalGrievanceDetail(ref: string, server = false) {
  return apiRequest<PortalGrievanceDetailData>(`/api/portal/grievances/${encodeURIComponent(ref)}`, {
    server,
  });
}

export async function respondToGrievance(ref: string, responseText: string, status: string) {
  return apiRequest<null>(`/api/portal/grievances/${encodeURIComponent(ref)}/respond`, {
    method: "POST",
    body: { response_text: responseText, status },
  });
}

export async function fetchPortalAnalytics(server = false) {
  return apiRequest<PortalAnalyticsData>("/api/portal/analytics", { server });
}

export async function fetchConstants(server = false) {
  return apiRequest<MetadataConstants>("/api/metadata/constants", { server });
}

export async function fetchOsdDashboard(slug: string, server = false) {
  return apiRequest<OsdDashboardData>(`/api/osd/${slug}/dashboard`, { server });
}

export async function fetchOsdGrievances(slug: string, params: Record<string, string> = {}, server = false) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/osd/${slug}/grievances?${qs}` : `/api/osd/${slug}/grievances`;
  return apiRequest<{ items: PsGrievanceRow[]; total: number }>(path, { server });
}

export async function fetchOsdGrievanceDetail(slug: string, ref: string, server = false) {
  return apiRequest<OsdGrievanceDetailData>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}`,
    { server },
  );
}

export async function updateOsdStatus(
  slug: string,
  ref: string,
  payload: { status: string; priority: string; remarks: string },
) {
  return apiRequest<null>(`/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export async function forwardOsdGrievance(
  slug: string,
  ref: string,
  payload: {
    remarks: string;
    recipients: Array<{ department: string; officer_name: string; email: string }>;
    cc?: string[];
    bcc?: string[];
  },
) {
  return apiRequest<null>(`/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/forward`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOsdDepartments(slug: string) {
  return apiRequest<{ items: OsdDepartmentContactRecord[] }>(`/api/osd/${slug}/departments`);
}

export async function createOsdDepartment(
  slug: string,
  payload: { department: string; officer_name: string; email: string },
) {
  return apiRequest<OsdDepartmentContactRecord>(`/api/osd/${slug}/departments`, {
    method: "POST",
    body: payload,
  });
}

export async function updateOsdDepartment(
  slug: string,
  id: number,
  payload: Partial<{ department: string; officer_name: string; email: string; is_active: boolean }>,
) {
  return apiRequest<OsdDepartmentContactRecord>(`/api/osd/${slug}/departments/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function fetchDepartmentGrievance(token: string, server = false) {
  return apiRequest<DepartmentGrievanceView>(
    `/api/department/grievances/${encodeURIComponent(token)}`,
    { server },
  );
}

export async function departmentAcknowledge(
  token: string,
  officerName: string,
  remarks: string,
  files: File[] = [],
) {
  const form = new FormData();
  form.append("officer_name", officerName);
  if (remarks) form.append("remarks", remarks);
  files.forEach((file) => form.append("files", file));
  return apiRequest<DepartmentActionData>(
    `/api/department/grievances/${encodeURIComponent(token)}/acknowledge`,
    { method: "POST", body: form },
  );
}

export async function departmentRespond(
  token: string,
  officerName: string,
  responseText: string,
  files: File[] = [],
) {
  const form = new FormData();
  form.append("officer_name", officerName);
  form.append("response_text", responseText);
  files.forEach((file) => form.append("files", file));
  return apiRequest<DepartmentActionData>(
    `/api/department/grievances/${encodeURIComponent(token)}/respond`,
    { method: "POST", body: form },
  );
}

export async function fetchStaffList(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/staff?${qs}` : "/api/staff";
  return apiRequest<StaffListData>(path);
}

export async function fetchStaffRoles() {
  return apiRequest<{ manageable_roles: string[] }>("/api/staff/roles");
}

export async function createStaffAccount(payload: Record<string, unknown>) {
  return apiRequest<StaffAccount>("/api/staff", { method: "POST", body: payload });
}

export async function updateStaffAccount(id: number, payload: Record<string, unknown>) {
  return apiRequest<StaffAccount>(`/api/staff/${id}`, { method: "PATCH", body: payload });
}

export async function deactivateStaffAccount(id: number) {
  return apiRequest<null>(`/api/staff/${id}`, { method: "DELETE" });
}

export async function activateStaffAccount(id: number) {
  return apiRequest<StaffAccount>(`/api/staff/${id}/activate`, { method: "POST" });
}

// ── Private Secretary API ──

export async function fetchPsDashboard(server = false) {
  return apiRequest<import("@/types/api").PsDashboardData>("/api/ps/dashboard", { server });
}

export async function fetchPsGrievances(params: Record<string, string> = {}, server = false) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/ps/grievances?${qs}` : "/api/ps/grievances";
  return apiRequest<{ items: import("@/types/api").PsGrievanceRow[]; total: number }>(path, {
    server,
  });
}

export async function fetchPsConversation(ref: string, server = false) {
  return apiRequest<import("@/types/api").GrievanceConversationData>(
    `/api/ps/grievances/${encodeURIComponent(ref)}/conversation`,
    { server },
  );
}

export async function psAddNote(ref: string, noteText: string) {
  return apiRequest<{ id: number; created_at: string }>(
    `/api/ps/grievances/${encodeURIComponent(ref)}/notes`,
    { method: "POST", body: { note_text: noteText } },
  );
}

export async function psWhatsAppReply(ref: string, message: string) {
  return apiRequest<null>(`/api/ps/grievances/${encodeURIComponent(ref)}/whatsapp-reply`, {
    method: "POST",
    body: { message },
  });
}

export async function fetchOsdConversation(slug: string, ref: string, server = false) {
  return apiRequest<import("@/types/api").GrievanceConversationData>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/conversation`,
    { server },
  );
}

export async function osdAddNote(slug: string, ref: string, noteText: string) {
  return apiRequest<{ id: number; created_at: string }>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/notes`,
    { method: "POST", body: { note_text: noteText } },
  );
}

export async function osdWhatsAppReply(slug: string, ref: string, message: string) {
  return apiRequest<null>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/whatsapp-reply`,
    { method: "POST", body: { message } },
  );
}

export async function osdEscalateToPs(slug: string, ref: string) {
  return apiRequest<null>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/escalate`,
    { method: "POST" },
  );
}

export async function osdRequestMoreInfo(slug: string, ref: string, message = "") {
  return apiRequest<null>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/request-info`,
    { method: "POST", body: { message } },
  );
}

export async function osdUploadAttachments(slug: string, ref: string, files: FileList | File[]) {
  const form = new FormData();
  for (const file of Array.from(files)) {
    form.append("files", file);
  }
  return apiRequest<{ uploaded: number }>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/attachments`,
    { method: "POST", body: form },
  );
}

export async function osdMarkResolved(slug: string, ref: string) {
  return apiRequest<null>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/resolve`,
    { method: "POST" },
  );
}

export async function osdReassignGrievance(slug: string, ref: string, osdCategory: string) {
  return apiRequest<null>(
    `/api/osd/${slug}/grievances/${encodeURIComponent(ref)}/reassign`,
    { method: "POST", body: { osd_category: osdCategory } },
  );
}
