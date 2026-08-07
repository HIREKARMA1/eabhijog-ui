import { apiRequest } from "@/lib/api/client";
import type {
  HearingActionResult,
  HearingDetail,
  HearingListData,
  HearingPublicSummary,
  HearingRegisterResult,
  HearingRegistrationListData,
  HearingRegistrationRow,
  PublicRegistrationTaxonomy,
} from "@/types/api";

export async function fetchPublicHearings(server = false) {
  return apiRequest<HearingPublicSummary[]>("/api/public/hearings", { server });
}

export async function fetchPublicHearing(hearingId: number, server = false) {
  return apiRequest<HearingPublicSummary>(`/api/public/hearings/${hearingId}`, { server });
}

export async function fetchPublicRegistrationTaxonomy(category: string, server = false) {
  const slug = SERVICE_CATEGORY_SLUGS[category] ?? category;
  const qs = new URLSearchParams({ category: slug }).toString();
  return apiRequest<PublicRegistrationTaxonomy>(
    `/api/public/taxonomy/registration?${qs}`,
    { server },
  );
}

/** URL-safe slugs avoid `&` breaking query strings (e.g. Steel & Mines). */
export const SERVICE_CATEGORY_SLUGS: Record<string, string> = {
  "Commerce & Transport": "commerce-transport",
  "Steel & Mines": "steel-mines",
  "Ganjam District": "ganjam-district",
  "Gopalpur Constituency": "gopalpur-constituency",
};

export async function registerForHearing(
  hearingId: number,
  form: FormData,
) {
  return apiRequest<HearingRegisterResult>(
    `/api/public/hearings/${hearingId}/register`,
    { method: "POST", body: form },
  );
}

export async function fetchHearings(server = false) {
  return apiRequest<HearingListData>("/api/hearings", { server });
}

export async function fetchHearing(hearingId: number, server = false) {
  return apiRequest<HearingDetail>(`/api/hearings/${hearingId}`, { server });
}

export async function createHearing(payload: Record<string, unknown>) {
  return apiRequest<HearingDetail>("/api/hearings", { method: "POST", body: payload });
}

export async function updateHearing(hearingId: number, payload: Record<string, unknown>) {
  return apiRequest<HearingDetail>(`/api/hearings/${hearingId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function fetchHearingRegistrations(
  hearingId: number,
  params: Record<string, string> = {},
  server = false,
) {
  const qs = new URLSearchParams(params).toString();
  const path = qs
    ? `/api/hearings/${hearingId}/registrations?${qs}`
    : `/api/hearings/${hearingId}/registrations`;
  return apiRequest<HearingRegistrationListData>(path, { server });
}

export async function screenHearingRegistration(
  hearingId: number,
  registrationId: number,
  action: "approve" | "reject",
  rejectionRemarks?: string,
) {
  return apiRequest<HearingRegistrationRow>(
    `/api/hearings/${hearingId}/registrations/${registrationId}/screen`,
    {
      method: "POST",
      body: {
        action,
        rejection_remarks: rejectionRemarks || null,
      },
    },
  );
}

export async function closeHearingRegistration(hearingId: number) {
  return apiRequest<HearingActionResult>(`/api/hearings/${hearingId}/close-registration`, {
    method: "POST",
  });
}

export async function finalizeHearingShortlist(hearingId: number) {
  return apiRequest<HearingActionResult>(`/api/hearings/${hearingId}/finalize-shortlist`, {
    method: "POST",
  });
}

export async function notifyHearingApproved(hearingId: number) {
  return apiRequest<HearingActionResult>(`/api/hearings/${hearingId}/notify`, {
    method: "POST",
  });
}

export async function startHearing(hearingId: number) {
  return apiRequest<HearingActionResult>(`/api/hearings/${hearingId}/start`, {
    method: "POST",
  });
}

export async function completeHearing(hearingId: number) {
  return apiRequest<HearingActionResult>(`/api/hearings/${hearingId}/complete`, {
    method: "POST",
  });
}

export async function recordHearingRemarks(
  hearingId: number,
  registrationId: number,
  ministerRemarks: string,
  markHeard = true,
) {
  return apiRequest<HearingRegistrationRow>(
    `/api/hearings/${hearingId}/registrations/${registrationId}/remarks`,
    {
      method: "POST",
      body: { minister_remarks: ministerRemarks, mark_heard: markHeard },
    },
  );
}
