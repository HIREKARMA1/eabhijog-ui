"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GrievanceAttachments } from "@/components/grievance/GrievanceAttachments";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { respondToGrievance } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import type { GrievanceRow } from "@/types/api";

type PortalGrievanceDetailProps = {
  grievance: GrievanceRow;
  allowedStatuses: string[];
  timeline: Array<{ title: string; description: string; created_at: string; actor_name: string | null }>;
};

export function PortalGrievanceDetail({
  grievance,
  allowedStatuses,
  timeline,
}: PortalGrievanceDetailProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] = useState(allowedStatuses[0] ?? grievance.status);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await respondToGrievance(grievance.reference_number, responseText, status);
      router.refresh();
      setResponseText("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title={grievance.reference_number} className="lg:col-span-2">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">{t("dashboard", "table.status")}</dt>
            <dd className="font-medium">{grievance.status_label ?? grievance.status}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "table.district")}</dt>
            <dd>{grievance.district ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "table.category")}</dt>
            <dd>{grievance.category ?? grievance.osd_category ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-text-muted">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap">{grievance.grievance_text ?? grievance.title ?? "—"}</dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-border pt-5">
          <GrievanceAttachments
            attachments={grievance.attachments}
            attachmentUrl={grievance.attachment_url}
          />
        </div>
      </Card>

      <Card title={t("dashboard", "grievance.respond")}>
        <form onSubmit={onSubmit} className="space-y-3">
          <Textarea
            label={t("dashboard", "grievance.responseText")}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            required
          />
          <Select
            label={t("dashboard", "table.status")}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={allowedStatuses.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {t("dashboard", "grievance.submitResponse")}
          </Button>
        </form>
      </Card>

      <Card title={t("dashboard", "grievance.timeline")} className="lg:col-span-3">
        <ul className="space-y-3">
          {timeline.map((event, idx) => (
            <li key={`${event.created_at}-${idx}`} className="border-l-2 border-border pl-4">
              <p className="font-semibold text-slate-900">{event.title}</p>
              <p className="text-sm text-text-muted">{event.description}</p>
              <p className="mt-1 text-xs text-text-muted">
                {event.actor_name ?? "System"} · {new Date(event.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
