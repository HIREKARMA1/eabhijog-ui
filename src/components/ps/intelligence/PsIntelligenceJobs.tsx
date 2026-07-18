"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import {
  downloadIntelligenceBriefingPdf,
  fetchIntelligenceMeta,
  fetchIntelligenceProgress,
  runIntelligenceJob,
  uploadIntelligenceScans,
} from "@/lib/api/ps-intelligence";
import { useIntelligenceManage } from "@/hooks/use-intelligence-access";

import { IntelligencePageIntro } from "./IntelligencePageIntro";
import { intelCard, intelMuted } from "./intelligence-styles";

type ProgressSnap = {
  running?: boolean;
  job_id?: number | null;
  status?: string;
  phase?: string;
  phase_label?: string;
  detail?: string;
  percent?: number;
  pages_total?: number;
  pages_ocr?: number;
  candidates_found?: number;
  briefing_pdf?: string | null;
  error?: string | null;
  sources?: string[];
};

type JobKind = "epaper" | "upload" | "idle";

function jobKindFromProgress(p: ProgressSnap): JobKind {
  const sources = p.sources ?? [];
  if (sources.includes("citizen_upload")) return "upload";
  if (sources.length > 0) return "epaper";
  return "idle";
}

function formatProgressMessage(p: ProgressSnap, kind: JobKind): string {
  if (p.running) {
    const label = p.phase_label || p.phase || p.status || "processing";
    const pct = typeof p.percent === "number" ? ` (${p.percent}%)` : "";
    const pages =
      p.pages_total && p.pages_ocr
        ? ` — OCR ${p.pages_ocr}/${p.pages_total} pages`
        : p.pages_total
          ? ` — ${p.pages_total} pages`
          : "";
    const detail = p.detail ? ` — ${p.detail}` : "";
    return kind === "upload"
      ? `Processing upload: ${label}${pct}${pages}${detail}`
      : `Running e-paper analysis: ${label}${pct}${pages}${detail}`;
  }

  const status = (p.status || "idle").toLowerCase();
  if (status === "completed" || status === "partial") {
    const n = p.candidates_found ?? 0;
    if (kind === "upload") {
      if (n === 0) {
        return "Upload complete — no Transport clips detected in this scan. Check that the PDF includes Commerce & Transport grievances, or try a clearer scan.";
      }
      return `Upload complete — ${n} clip${n === 1 ? "" : "s"} ready in the review queue.`;
    }
    if (n === 0) {
      return "E-paper analysis complete — no Transport clips found in today's selected papers. Try more sources or check Review queue for earlier runs.";
    }
    return `E-paper analysis complete — ${n} clip${n === 1 ? "" : "s"} ready in the review queue.`;
  }
  if (status === "failed") {
    return kind === "upload"
      ? `Upload failed${p.error ? `: ${p.error}` : "."}`
      : `E-paper analysis failed${p.error ? `: ${p.error}` : "."}`;
  }
  return "";
}

export function PsIntelligenceJobs() {
  const { canManage, loading: accessLoading } = useIntelligenceManage();
  const [sources, setSources] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"idle" | "running" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [lastJobId, setLastJobId] = useState<number | null>(null);
  const [briefingReady, setBriefingReady] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const refreshProgress = useCallback(() => {
    fetchIntelligenceProgress()
      .then((raw) => {
        const p = raw as ProgressSnap;
        const kind = jobKindFromProgress(p);
        const msg = formatProgressMessage(p, kind);
        if (typeof p.job_id === "number") {
          setLastJobId(p.job_id);
        }
        if (p.running) {
          setStatusKind("running");
          setStatus(msg || "Running analysis…");
          setBriefingReady(false);
        } else if (msg && p.running === false && kind !== "idle") {
          const st = (p.status || "").toLowerCase();
          setStatusKind(st === "failed" ? "error" : "success");
          setStatus(msg);
          setBriefingReady(st !== "failed" && Boolean(p.job_id || p.briefing_pdf));
        }
      })
      .catch(() => {});
  }, []);

  async function downloadBriefing() {
    if (!lastJobId) return;
    setDownloadingPdf(true);
    setError("");
    try {
      await downloadIntelligenceBriefingPdf(lastJobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  }

  useEffect(() => {
    fetchIntelligenceMeta()
      .then((m) => {
        const list = (m.enabled_sources as string[]) || [];
        setSources(list);
        setSelected(list.slice(0, 2));
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    refreshProgress();
    const timer = setInterval(refreshProgress, 4000);
    return () => clearInterval(timer);
  }, [refreshProgress]);

  function toggleSource(s: string) {
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function runEpaper() {
    setError("");
    setStatusKind("running");
    setStatus("Starting e-paper job…");
    try {
      await runIntelligenceJob({ sources: selected, edition_date: "today" });
      setStatus("Job started — downloading and OCR may take 15–40 minutes for Odia papers.");
      refreshProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job failed");
      setStatusKind("error");
      setStatus("");
    }
  }

  async function uploadScans() {
    if (!files?.length) {
      setError("Select at least one image or PDF.");
      return;
    }
    setError("");
    setStatusKind("running");
    setStatus("Uploading scans…");
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    form.append("language", "or");
    try {
      await uploadIntelligenceScans(form);
      setStatus("Upload started. Check the review queue shortly.");
      refreshProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatusKind("error");
      setStatus("");
    }
  }

  const statusBoxClass =
    statusKind === "running"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : statusKind === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-red-200 bg-red-50 text-red-900";

  return (
    <div className="space-y-6">
      <IntelligencePageIntro
        title="Step 1 — Collect clips"
        description="Run e-papers or upload a scan. After analysis finishes, download the Department Information PDF (Commerce & Transport + Steel & Mines) for PS reading — then use Review queue for actionable Transport grievances."
        action={
          <LinkButton href="/ps/intelligence/candidates" variant="outline">
            Next: Review queue →
          </LinkButton>
        }
      />

      {!canManage && !accessLoading ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Read-only access. Job runs and uploads require PS or Transport Intelligence Officer role.
        </p>
      ) : null}

      <section className={intelCard}>
        <h2 className="text-lg font-semibold text-slate-900">Option A — E-paper scrape</h2>
        <p className={`mt-1 ${intelMuted}`}>
          Select Odia/English papers and run Transport extraction. Samaja + Sambad alone can take
          20–35 minutes (OCR on ~37 pages).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {sources.map((s) => (
            <label
              key={s}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-navy-700/40"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-saffron"
                checked={selected.includes(s)}
                onChange={() => toggleSource(s)}
              />
              {s}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <Button
            type="button"
            onClick={runEpaper}
            disabled={selected.length === 0 || !canManage || statusKind === "running"}
          >
            {statusKind === "running" ? "Analysis in progress…" : "Run e-paper analysis"}
          </Button>
        </div>
      </section>

      <section className={intelCard}>
        <h2 className="text-lg font-semibold text-slate-900">Option B — Upload PDF or scan</h2>
        <p className={`mt-1 ${intelMuted}`}>
          Upload JPG, PNG, or PDF (e.g. daily grievance report). Usually finishes in 1–3 minutes.
        </p>
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          className="mt-4 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          onChange={(e) => setFiles(e.target.files)}
        />
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={uploadScans}
            disabled={!canManage || statusKind === "running"}
          >
            Upload and analyze
          </Button>
        </div>
      </section>

      {status && (statusKind === "running" || statusKind === "error" || statusKind === "success") ? (
        <div className={`space-y-3 rounded-xl border p-4 text-sm ${statusBoxClass}`}>
          <p className="font-medium">{status}</p>
          {statusKind === "success" && lastJobId ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={downloadBriefing} disabled={downloadingPdf}>
                {downloadingPdf ? "Preparing PDF…" : "Download department briefing PDF"}
              </Button>
              <span className="text-xs text-slate-600">
                Job #{lastJobId}
                {briefingReady ? " · Commerce & Transport + Steel & Mines" : ""}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
