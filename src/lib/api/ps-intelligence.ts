import { ApiError, apiRequest } from "@/lib/api/client";
import { getClientApiBase } from "@/config/env";

export type IntelligenceCandidate = {
  id: number;
  source: string;
  channel: string;
  external_id?: string | null;
  title?: string | null;
  summary?: string | null;
  grievance_text?: string | null;
  grievance_text_en?: string | null;
  odia_excerpt?: string | null;
  district?: string | null;
  location?: string | null;
  osd_category?: string | null;
  confidence?: number | null;
  status: string;
  chatbot_reference?: string | null;
  edition_name?: string | null;
  edition_date?: string | null;
  page_number?: number | null;
  created_at?: string | null;
};

export type IntelligenceDashboard = {
  kpi: {
    pages_processed: number;
    transport_total: number;
    whatsapp_mirrored?: number;
    avg_confidence_pct: number;
    approved: number;
    pushed: number;
    rejected: number;
    quick: number;
    verify: number;
    threshold_pct: number;
  };
  briefing: IntelligenceCandidate[];
  recent: IntelligenceCandidate[];
  jobs: Array<{
    id: number;
    status: string | null;
    trigger: string;
    pages_scraped: number;
    candidates_found: number;
    started_at: string | null;
    finished_at: string | null;
  }>;
};

export async function fetchIntelligenceDashboard() {
  const base = getClientApiBase();
  const path = "/api/ps/intelligence/dashboard";
  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new ApiError(payload.error?.message ?? payload.message ?? "Request failed", res.status);
  }
  if (payload.success === false) {
    throw new ApiError(payload.error?.message ?? payload.message ?? "Request failed", res.status);
  }
  return payload as IntelligenceDashboard & { success: boolean };
}

export async function fetchIntelligenceCandidates(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/ps/intelligence/candidates?${qs}` : "/api/ps/intelligence/candidates";
  const res = await apiRequest<IntelligenceCandidate[]>(path);
  return res as unknown as {
    success: boolean;
    data: IntelligenceCandidate[];
    meta: { total: number; page: number; page_size: number; threshold: number };
  };
}

export async function fetchIntelligenceCandidate(id: number) {
  const res = await apiRequest<IntelligenceCandidate>(`/api/ps/intelligence/candidates/${id}`);
  return res as unknown as {
    success: boolean;
    data: IntelligenceCandidate;
    conf?: Record<string, unknown>;
    explain?: Record<string, unknown>;
    trust?: Record<string, unknown>;
    districts?: string[];
    osd_categories?: string[];
  };
}

export async function updateIntelligenceCandidate(id: number, body: Record<string, unknown>) {
  const res = await apiRequest<IntelligenceCandidate>(
    `/api/ps/intelligence/candidates/${id}/update`,
    { method: "POST", body },
  );
  return res as unknown as { success: boolean; action: string; data: IntelligenceCandidate };
}

export async function runIntelligenceJob(body: Record<string, unknown>) {
  return apiRequest<null>("/api/ps/intelligence/jobs/run", { method: "POST", body });
}

export async function uploadIntelligenceScans(form: FormData) {
  return apiRequest<null>("/api/ps/intelligence/jobs/upload", { method: "POST", body: form });
}

export async function fetchIntelligenceProgress() {
  const base = getClientApiBase();
  const res = await fetch(`${base}/api/ps/intelligence/progress`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return (await res.json()) as Record<string, unknown> & { success?: boolean; running?: boolean };
}

export async function fetchIntelligenceMeta() {
  const base = getClientApiBase();
  const res = await fetch(`${base}/api/ps/intelligence/meta`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new ApiError(payload.error?.message ?? "Request failed", res.status);
  }
  return payload as Record<string, unknown> & { success: boolean; enabled_sources: string[] };
}

export function intelligencePageImageUrl(candidateId: number): string {
  return `/backend/api/ps/intelligence/candidates/${candidateId}/page-image`;
}

export function intelligenceBriefingPdfUrl(jobId: number): string {
  return `/backend/api/ps/intelligence/jobs/${jobId}/briefing-pdf`;
}

export async function downloadIntelligenceBriefingPdf(jobId: number): Promise<void> {
  const base = getClientApiBase();
  const res = await fetch(`${base}/api/ps/intelligence/jobs/${jobId}/briefing-pdf`, {
    credentials: "include",
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new ApiError(
      (payload as { error?: { message?: string }; message?: string }).error?.message
        ?? (payload as { message?: string }).message
        ?? "Could not download briefing PDF",
      res.status,
    );
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `department_briefing_job_${jobId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type IntelligenceIncident = {
  id: number;
  title?: string | null;
  status?: string | null;
  severity?: string | null;
  district?: string | null;
  source_count?: number | null;
  summary?: string | null;
  updated_at?: string | null;
};

export type IntelligenceAnalytics = {
  districts?: Array<{
    district: string;
    complaints: number;
    pending: number;
    resolved: number;
    critical: number;
    trend?: string;
  }>;
  department?: {
    score?: number;
    pending?: number;
    resolved?: number;
    total?: number;
    by_category?: Record<string, number>;
    notes?: string[];
  };
  quality?: {
    avg_confidence_pct?: number;
    needs_verification_pct?: number;
  };
  alerts?: Array<{ title?: string; message?: string }>;
  channels?: string[];
};

export async function fetchIntelligenceIncidents() {
  const base = getClientApiBase();
  const res = await fetch(`${base}/api/ps/intelligence/incidents`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new ApiError(payload.error?.message ?? "Request failed", res.status);
  }
  return payload as {
    success: boolean;
    open_count: number;
    high_count: number;
    incidents: IntelligenceIncident[];
  };
}

export async function fetchIntelligenceIncident(id: number) {
  const base = getClientApiBase();
  const res = await fetch(`${base}/api/ps/intelligence/incidents/${id}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new ApiError(payload.error?.message ?? "Request failed", res.status);
  }
  return payload as {
    success: boolean;
    incident: IntelligenceIncident;
    candidates: IntelligenceCandidate[];
  };
}

export async function fetchIntelligenceAnalytics() {
  const base = getClientApiBase();
  const res = await fetch(`${base}/api/ps/intelligence/intelligence`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new ApiError(payload.error?.message ?? "Request failed", res.status);
  }
  return payload as IntelligenceAnalytics & { success: boolean };
}
