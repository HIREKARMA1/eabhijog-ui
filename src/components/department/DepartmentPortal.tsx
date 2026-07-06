"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import {
  departmentAcknowledge,
  departmentRespond,
  fetchDepartmentGrievance,
} from "@/lib/api/portal";
import type { DepartmentGrievanceView } from "@/types/api";

function formatDate(value: string | null, withTime = false): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function statusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const COMPLETED_STATUSES = new Set(["action_taken", "closed", "resolved"]);

const MAX_UPLOADS = 5;
const ACCEPTED_UPLOAD_TYPES = "image/jpeg,image/png,video/mp4,video/3gpp";

function isVideoUrl(url: string): boolean {
  return /\.(mp4|3gp|3gpp|mov|webm)(\?|$)/i.test(url);
}

function FileField({
  label,
  files,
  onChange,
  inputId,
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  inputId: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={inputId}
        type="file"
        multiple
        accept={ACCEPTED_UPLOAD_TYPES}
        onChange={(e) => onChange(Array.from(e.target.files ?? []).slice(0, MAX_UPLOADS))}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-700/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-navy-700 hover:file:bg-navy-700/20"
      />
      <p className="text-xs text-text-muted">
        Photos (jpg/png) or video (mp4/3gp) shared with the citizen on WhatsApp. Up to {MAX_UPLOADS} files.
      </p>
      {files.length > 0 ? (
        <ul className="mt-1 space-y-1 text-xs text-slate-600">
          {files.map((f) => (
            <li key={f.name} className="truncate">
              {f.name} ({(f.size / (1024 * 1024)).toFixed(2)} MB)
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function DepartmentPortal({ token }: { token: string }) {
  const { t } = useI18n();
  const [view, setView] = useState<DepartmentGrievanceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [officerName, setOfficerName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [responseText, setResponseText] = useState("");
  const [ackFiles, setAckFiles] = useState<File[]>([]);
  const [respondFiles, setRespondFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetchDepartmentGrievance(token);
      setView(res.data);
      setOfficerName((prev) => prev || res.data.recipient_name || "");
      setLoadError("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 410) {
        setLoadError(
          "This department portal link has expired. Please contact the forwarding OSD office for a new link.",
        );
      } else if (err instanceof ApiError && err.status === 404) {
        setLoadError("This link is invalid or has been revoked.");
      } else {
        setLoadError("Unable to load the grievance. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAcknowledge(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setNotice("");
    setSubmitting(true);
    try {
      await departmentAcknowledge(token, officerName, remarks, ackFiles);
      setRemarks("");
      setAckFiles([]);
      setNotice("Receipt acknowledged and shared with the citizen.");
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not acknowledge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRespond(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setNotice("");
    setSubmitting(true);
    try {
      await departmentRespond(token, officerName, responseText, respondFiles);
      setResponseText("");
      setRespondFiles([]);
      setNotice("Response recorded and shared with the citizen.");
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-surface">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-lg font-bold text-navy-700">{t("common", "brand.name")}</div>
            <div className="text-xs text-text-muted">
              Department Grievance Portal · Govt. of Odisha
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger">
            {loadError}
          </div>
        ) : view ? (
          <div className="space-y-5">
            {notice ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-success">
                {notice}
              </div>
            ) : null}

            <Card className="p-0">
              <div className="flex items-start justify-between border-b border-border px-4 py-4">
                <div>
                  <h1 className="font-mono text-lg font-semibold text-slate-900">
                    {view.reference_number}
                  </h1>
                  <p className="text-sm text-text-muted">{view.recipient_department}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-700/10 px-3 py-1 text-xs font-semibold text-navy-700">
                  {statusLabel(view.status)}
                </span>
              </div>

              {view.sla_deadline_at ? (
                <div className="border-b border-border bg-amber-50 px-4 py-2 text-sm text-amber-900">
                  SLA deadline: <strong>{formatDate(view.sla_deadline_at, true)}</strong>
                </div>
              ) : null}

              <div className="space-y-3 px-4 py-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-text-muted">Citizen: </span>
                    <strong>{view.citizen_name}</strong>
                  </div>
                  <div>
                    <span className="text-text-muted">Phone: </span>
                    <span className="font-mono">{view.citizen_phone}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">District: </span>
                    {view.geographic_district}
                  </div>
                  <div>
                    <span className="text-text-muted">Category: </span>
                    {view.osd_category}
                  </div>
                </div>
                <div>
                  <span className="text-text-muted">Title:</span>
                  <p className="mt-1 font-medium text-slate-900">{view.title}</p>
                </div>
                <div className="whitespace-pre-wrap rounded-lg bg-surface p-3 text-slate-700">
                  {view.grievance_text}
                </div>
                {view.department_response_text ? (
                  <div className="border-t border-border pt-3">
                    <span className="text-text-muted">Previous response:</span>
                    <p className="mt-1 whitespace-pre-wrap rounded-lg bg-emerald-50 p-3 text-slate-700">
                      {view.department_response_text}
                    </p>
                  </div>
                ) : null}
                {view.department_attachments.length > 0 ? (
                  <div className="border-t border-border pt-3">
                    <span className="text-text-muted">Department attachments:</span>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {view.department_attachments.map((url) =>
                        isVideoUrl(url) ? (
                          <video
                            key={url}
                            src={url}
                            controls
                            className="h-28 w-full rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={url}
                              alt="Department attachment"
                              className="h-28 w-full rounded-lg border border-border object-cover"
                            />
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>

            {formError ? (
              <div className="rounded-lg border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger">
                {formError}
              </div>
            ) : null}

            {view.allowed_actions.includes("acknowledge") ? (
              <Card title="Acknowledge Receipt">
                <form onSubmit={onAcknowledge} className="space-y-3">
                  <Input
                    label="Officer name"
                    name="officer_name_ack"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                    minLength={2}
                  />
                  <Textarea
                    label="Remarks (shared with citizen)"
                    name="remarks"
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <FileField
                    label="Attach photos / video (optional)"
                    inputId="ack_files"
                    files={ackFiles}
                    onChange={setAckFiles}
                  />
                  <Button type="submit" variant="secondary" disabled={submitting}>
                    {submitting ? <Spinner className="h-4 w-4" /> : null}
                    Acknowledge Receipt
                  </Button>
                </form>
              </Card>
            ) : null}

            {view.allowed_actions.includes("respond") ? (
              <Card
                title={
                  view.status === "action_taken"
                    ? "Submit Follow-up Update"
                    : "Submit Department Action"
                }
              >
                {view.status === "action_taken" ? (
                  <p className="mb-3 text-sm text-text-muted">
                    Action already recorded. You can post additional updates (with photos/video)
                    — each one is shared with the citizen on WhatsApp.
                  </p>
                ) : null}
                <form onSubmit={onRespond} className="space-y-3">
                  <Input
                    label="Officer name"
                    name="officer_name_respond"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                    minLength={2}
                  />
                  <Textarea
                    label={view.status === "action_taken" ? "Update details" : "Action taken"}
                    name="response_text"
                    rows={5}
                    required
                    minLength={10}
                    placeholder="Describe the action taken to resolve this grievance..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  <FileField
                    label="Attach photos / video (optional)"
                    inputId="respond_files"
                    files={respondFiles}
                    onChange={setRespondFiles}
                  />
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? <Spinner className="h-4 w-4" /> : null}
                    {view.status === "action_taken" ? "Submit Update" : "Submit Resolution"}
                  </Button>
                </form>
              </Card>
            ) : COMPLETED_STATUSES.has(view.status) ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-success">
                Action completed — no further steps required on this link.
              </div>
            ) : null}

            {view.token_expires_at ? (
              <p className="text-center text-xs text-text-muted">
                Link expires {formatDate(view.token_expires_at)}
              </p>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
