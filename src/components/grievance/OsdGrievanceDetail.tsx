"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GrievanceAttachments } from "@/components/grievance/GrievanceAttachments";
import { OsdForwardForm } from "@/components/grievance/OsdForwardForm";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { updateOsdStatus } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import type { GrievanceRow, OsdDepartmentContact } from "@/types/api";

type OsdGrievanceDetailProps = {
  osdSlug: string;
  grievance: GrievanceRow;
  allowedStatuses: string[];
  priorities: string[];
  suggestedRecipients: OsdDepartmentContact[];
  timeline: Array<{ title: string; description: string; created_at: string }>;
};

export function OsdGrievanceDetailView({
  osdSlug,
  grievance,
  allowedStatuses,
  priorities,
  suggestedRecipients,
  timeline,
}: OsdGrievanceDetailProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [status, setStatus] = useState(grievance.status);
  const [priority, setPriority] = useState(grievance.priority ?? "normal");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");

  async function onStatusSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await updateOsdStatus(osdSlug, grievance.reference_number, { status, priority, remarks });
      router.refresh();
      setMessage("Status updated.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="mb-2 lg:col-span-3">
        <Link
          href={`/osd/${osdSlug}/grievance/${grievance.reference_number}/conversation`}
          className="text-sm text-brand hover:underline"
        >
          Open WhatsApp conversation →
        </Link>
      </div>
      <Card title={grievance.reference_number} className="lg:col-span-2">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Citizen</dt>
            <dd>{grievance.citizen_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "table.district")}</dt>
            <dd>{grievance.geographic_district ?? grievance.district ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-text-muted">Grievance</dt>
            <dd className="mt-1 whitespace-pre-wrap">{grievance.grievance_text ?? grievance.title}</dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-border pt-5">
          <GrievanceAttachments
            attachments={grievance.attachments}
            attachmentUrl={grievance.attachment_url}
          />
        </div>
      </Card>

      <Card title={t("dashboard", "grievance.updateStatus")}>
        <form onSubmit={onStatusSubmit} className="space-y-3">
          <Select
            label={t("dashboard", "table.status")}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={allowedStatuses.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
          />
          <Select
            label={t("dashboard", "grievance.priority")}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={priorities.map((p) => ({ value: p, label: p }))}
          />
          <Textarea label={t("dashboard", "grievance.remarks")} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <Button type="submit" className="w-full">{t("dashboard", "grievance.updateStatus")}</Button>
        </form>
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
      </Card>

      <div className="lg:col-span-3">
        <OsdForwardForm
          osdSlug={osdSlug}
          referenceNumber={grievance.reference_number}
          suggestedRecipients={suggestedRecipients}
        />
      </div>

      <Card title={t("dashboard", "grievance.timeline")} className="lg:col-span-3">
        <ul className="space-y-3">
          {timeline.map((event, idx) => (
            <li key={idx} className="border-l-2 border-border pl-4">
              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-text-muted">{event.description}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
