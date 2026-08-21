import { ApiError, apiRequest } from "@/lib/api/client";
import { getClientApiBase } from "@/config/env";
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
  Others: "others",
};

export const HEARING_DESK_CATEGORIES = [
  { value: "Commerce & Transport", key: "categories.commerce" },
  { value: "Steel & Mines", key: "categories.steel" },
  { value: "Ganjam District", key: "categories.ganjam" },
  { value: "Gopalpur Constituency", key: "categories.gopalpur" },
  { value: "Others", key: "categories.others" },
] as const;

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

export async function uploadHearingBanner(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<{
    storage_key: string;
    banner_image_url: string;
    hearing_id: number | null;
  }>("/api/hearings/banner-upload", { method: "POST", body: form });
}

export async function uploadHearingBannerForEvent(hearingId: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<HearingDetail>(`/api/hearings/${hearingId}/banner`, {
    method: "POST",
    body: form,
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

export async function exportHearingRegistrationsCsv(
  hearingId: number,
  opts?: { screeningStatus?: string; serviceCategory?: string } | string,
) {
  const base = getClientApiBase();
  const qs = new URLSearchParams();
  const screeningStatus =
    typeof opts === "string" ? opts : opts?.screeningStatus;
  const serviceCategory = typeof opts === "string" ? undefined : opts?.serviceCategory;
  if (screeningStatus) qs.set("screening_status", screeningStatus);
  if (serviceCategory) qs.set("service_category", serviceCategory);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetch(
    `${base}/api/hearings/${hearingId}/registrations/export${suffix}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new ApiError(
      (payload as { error?: { message?: string }; message?: string }).error?.message
        ?? (payload as { message?: string }).message
        ?? "Could not export CSV",
      res.status,
    );
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="([^"]+)"/i.exec(disposition);
  const filename =
    match?.[1] ||
    `hearing_${hearingId}_registrations${screeningStatus ? `_${screeningStatus}` : ""}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadHearingRegistrationPdf(
  hearingId: number,
  registrationId: number,
  lang: string = "en",
) {
  const base = getClientApiBase();
  const qs = new URLSearchParams({
    lang: lang === "hi" || lang === "or" ? lang : "en",
  });
  const res = await fetch(
    `${base}/api/hearings/${hearingId}/registrations/${registrationId}/pdf?${qs}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new ApiError(
      (payload as { error?: { message?: string }; message?: string }).error?.message
        ?? (payload as { message?: string }).message
        ?? "Could not download PDF",
      res.status,
    );
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="([^"]+)"/i.exec(disposition);
  const filename = match?.[1] || `hearing-${hearingId}-reg-${registrationId}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function sendHearingRegistrationWhatsApp(
  hearingId: number,
  registrationId: number,
  message: string,
) {
  return apiRequest<null>(
    `/api/hearings/${hearingId}/registrations/${registrationId}/whatsapp`,
    {
      method: "POST",
      body: { message },
    },
  );
}

export async function downloadPublicHearingRegistrationPdf(
  hearingId: number,
  registrationId: number,
  referenceNumber: string,
  lang: string = "en",
) {
  const base = getClientApiBase();
  const qs = new URLSearchParams({
    ref: referenceNumber,
    lang: lang === "hi" || lang === "or" ? lang : "en",
  });
  const res = await fetch(
    `${base}/api/public/hearings/${hearingId}/registrations/${registrationId}/pdf?${qs}`,
  );
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new ApiError(
      (payload as { error?: { message?: string }; message?: string }).error?.message
        ?? (payload as { message?: string }).message
        ?? "Could not download PDF",
      res.status,
    );
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="([^"]+)"/i.exec(disposition);
  const filename =
    match?.[1] ||
    `hearing-${hearingId}-${referenceNumber.replace(/\//g, "-")}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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

export async function deleteHearing(hearingId: number) {
  return apiRequest<HearingActionResult>(`/api/hearings/${hearingId}`, {
    method: "DELETE",
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
