"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeleteGrievanceButton } from "@/components/grievance/DeleteGrievanceButton";
import { DownloadPdfMenu } from "@/components/grievance/DownloadPdfMenu";
import { GrievanceAttachments } from "@/components/grievance/GrievanceAttachments";
import { GrievanceJourneyTimeline } from "@/components/grievance/GrievanceJourneyTimeline";
import { WhatsAppTranscript } from "@/components/grievance/WhatsAppTranscript";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { respondToGrievance, downloadPortalGrievancePdf } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import { osdSlugForCategory } from "@/lib/osd/desks";
import type { GrievanceRow, JourneyEvent, WhatsAppMessageItem } from "@/types/api";

type PortalGrievanceDetailProps = {
  grievance: GrievanceRow;
  allowedStatuses: string[];
  journey: JourneyEvent[];
  messages: WhatsAppMessageItem[];
};

export function PortalGrievanceDetail({
  grievance,
  allowedStatuses,
  journey,
  messages,
}: PortalGrievanceDetailProps) {
  const { t } = useI18n();
  const router = useRouter();
  const osdSlug = osdSlugForCategory(grievance.osd_category);
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] = useState(allowedStatuses[0] ?? grievance.status);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

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

  async function onDownload() {
    setDownloadError("");
    setDownloading(true);
    try {
      await downloadPortalGrievancePdf(grievance.reference_number);
    } catch (err) {
      setDownloadError(err instanceof ApiError ? err.message : t("dashboard", "table.downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">{grievance.reference_number}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DownloadPdfMenu size="sm" loading={downloading} onDownload={() => void onDownload()} />
            <DeleteGrievanceButton
              referenceNumber={grievance.reference_number}
              filingSource={grievance.filing_source}
              onDeleted={() => router.push("/dashboard/grievances")}
            />
          </div>
        </header>
        {downloadError ? <p className="mb-3 text-sm text-danger">{downloadError}</p> : null}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">{t("dashboard", "table.status")}</dt>
            <dd className="font-medium">{grievance.status_label ?? grievance.status}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "table.district")}</dt>
            <dd>{grievance.district ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "table.category")}</dt>
            <dd>{grievance.category ?? grievance.osd_category ?? "-"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-text-muted">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap">{grievance.grievance_text ?? grievance.title ?? "-"}</dd>
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
          <Button type="submit" loading={loading} className="w-full">
            {t("dashboard", "grievance.submitResponse")}
          </Button>
        </form>
      </Card>

      <GrievanceJourneyTimeline events={journey} className="lg:col-span-3" />

      <Card title={t("dashboard", "grievance.conversationTitle")} className="lg:col-span-3">
        {osdSlug ? (
          <p className="mb-3">
            <Link
              href={`/osd/${osdSlug}/grievance/${encodeURIComponent(grievance.reference_number)}/conversation`}
              className="text-sm font-semibold text-saffron hover:text-saffron-hover"
            >
              {t("dashboard", "grievance.openOsdConversation")}
            </Link>
          </p>
        ) : null}
        <WhatsAppTranscript messages={messages} />
      </Card>
    </div>
  );
}
