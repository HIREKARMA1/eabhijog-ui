"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DownloadPdfMenu } from "@/components/grievance/DownloadPdfMenu";
import { GrievanceAttachments } from "@/components/grievance/GrievanceAttachments";
import { GrievanceJourneyTimeline } from "@/components/grievance/GrievanceJourneyTimeline";
import { GrievanceListBackLink } from "@/components/grievance/GrievanceListBackLink";
import { OsdForwardForm } from "@/components/grievance/OsdForwardForm";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { downloadPortalGrievancePdf, updateOsdStatus } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import {
  CITIZEN_WHATSAPP_MAX_CHARS,
  citizenWhatsAppLengthError,
  isStatusMessageStatus,
} from "@/lib/grievance/statusMessageTemplates";
import {
  filterOsdUpdateStatusOptions,
  formatPriorityLabel,
  formatStatusLabel,
} from "@/lib/grievance/display";
import { ExpandableText } from "@/components/grievance/ExpandableText";
import { useI18n } from "@/lib/i18n/context";
import type { GrievanceRow, JourneyEvent, OsdDepartmentContact } from "@/types/api";

type OsdGrievanceDetailProps = {
  osdSlug: string;
  grievance: GrievanceRow;
  allowedStatuses: string[];
  priorities: string[];
  suggestedRecipients: OsdDepartmentContact[];
  resolvedRecipients: OsdDepartmentContact[];
  journey: JourneyEvent[];
};

export function OsdGrievanceDetailView({
  osdSlug,
  grievance,
  allowedStatuses,
  priorities,
  suggestedRecipients,
  resolvedRecipients,
  journey,
}: OsdGrievanceDetailProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [status, setStatus] = useState(grievance.status);
  const [priority, setPriority] = useState(grievance.priority ?? "normal");
  const [citizenMessage, setCitizenMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "warning">("success");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const statusOptions = useMemo(
    () => filterOsdUpdateStatusOptions(allowedStatuses, grievance.status),
    [allowedStatuses, grievance.status],
  );

  const showCitizenMessage = isStatusMessageStatus(status);

  function handleStatusChange(nextStatus: string) {
    setStatus(nextStatus);
    setFeedback("");
  }

  async function onStatusSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedback("");
    if (showCitizenMessage && !citizenMessage.trim()) {
      setFeedbackTone("warning");
      setFeedback("Enter remarks for the citizen WhatsApp message.");
      return;
    }
    const lengthError = showCitizenMessage
      ? citizenWhatsAppLengthError(citizenMessage)
      : null;
    if (lengthError) {
      setFeedbackTone("warning");
      setFeedback(lengthError);
      return;
    }
    setLoading(true);
    try {
      const result = await updateOsdStatus(osdSlug, grievance.reference_number, {
        status,
        priority,
        remarks: "",
        citizen_message: showCitizenMessage ? citizenMessage.trim() : "",
      });
      router.refresh();
      const warning = result.data?.whatsapp_warning;
      if (warning) {
        setFeedbackTone("warning");
        setFeedback(warning);
      } else {
        setFeedbackTone("success");
        setFeedback(result.message || "Status updated.");
      }
    } catch (err) {
      setFeedbackTone("warning");
      setFeedback(err instanceof ApiError ? err.message : t("common", "errors.generic"));
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
      <div className="mb-2 flex flex-col gap-2 lg:col-span-3">
        <GrievanceListBackLink
          listHref={`/osd/${osdSlug}/grievances`}
          disposedListHref={`/osd/${osdSlug}/disposed-grievances`}
        />
        <Link
          href={`/osd/${osdSlug}/grievance/${grievance.reference_number}/conversation`}
          className="text-sm text-brand hover:underline"
        >
          Open WhatsApp conversation →
        </Link>
      </div>
      <Card className="lg:col-span-2">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">{grievance.reference_number}</h2>
          <DownloadPdfMenu size="sm" loading={downloading} onDownload={() => void onDownload()} />
        </header>
        {downloadError ? <p className="mb-3 text-sm text-danger">{downloadError}</p> : null}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Citizen</dt>
            <dd>{grievance.citizen_name ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "table.district")}</dt>
            <dd>{grievance.geographic_district ?? grievance.district ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "grievance.taxonomyDepartment")}</dt>
            <dd>
              {grievance.department &&
              grievance.department.trim().toLowerCase() !==
                (grievance.osd_category ?? grievance.category ?? "").trim().toLowerCase()
                ? grievance.department
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "grievance.taxonomySubDepartment")}</dt>
            <dd>{grievance.sub_department?.trim() || "-"}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{t("dashboard", "grievance.taxonomyOrganization")}</dt>
            <dd>{grievance.organization?.trim() || "-"}</dd>
          </div>
          <div className="sm:col-span-2 space-y-3">
            {(() => {
              const body = grievance.grievance_text?.trim() ?? "";
              const title = grievance.title?.trim() ?? "";
              const showBoth = Boolean(body && title && body !== title);
              if (showBoth) {
                return (
                  <>
                    <div>
                      <dt className="text-text-muted">Title</dt>
                      <dd className="mt-1">
                        <ExpandableText text={title} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Grievance</dt>
                      <dd className="mt-1">
                        <ExpandableText text={body} />
                      </dd>
                    </div>
                  </>
                );
              }
              return (
                <>
                  <dt className="text-text-muted">Grievance</dt>
                  <dd className="mt-1">
                    <ExpandableText text={body || title} />
                  </dd>
                </>
              );
            })()}
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
            onChange={(e) => handleStatusChange(e.target.value)}
            options={statusOptions.map((s) => ({
              value: s,
              label: formatStatusLabel(s),
            }))}
          />
          <Select
            label={t("dashboard", "grievance.priority")}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={priorities.map((p) => ({ value: p, label: formatPriorityLabel(p) }))}
          />
          {showCitizenMessage ? (
            <div className="space-y-1.5">
              <Textarea
                label={t("dashboard", "grievance.remarksForCitizenWhatsApp")}
                value={citizenMessage}
                onChange={(e) => setCitizenMessage(e.target.value)}
                rows={5}
                placeholder={t("dashboard", "grievance.citizenMessagePlaceholder")}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-text-muted">
                  {t("dashboard", "grievance.citizenMessageHint")}
                </p>
                <p
                  className={`text-xs tabular-nums ${
                    citizenMessage.trim().length > CITIZEN_WHATSAPP_MAX_CHARS
                      ? "font-medium text-amber-700"
                      : "text-text-muted"
                  }`}
                >
                  {citizenMessage.trim().length}/{CITIZEN_WHATSAPP_MAX_CHARS}
                </p>
              </div>
            </div>
          ) : null}
          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            {t("dashboard", "grievance.updateStatus")}
          </Button>
        </form>
        {feedback ? (
          <p
            className={`mt-3 text-sm ${
              feedbackTone === "success" ? "text-success" : "text-amber-700"
            }`}
          >
            {feedback}
          </p>
        ) : null}
      </Card>

      <div id="osd-forward-form" className="scroll-mt-4 rounded-xl transition-shadow lg:col-span-3">
        <OsdForwardForm
          osdSlug={osdSlug}
          referenceNumber={grievance.reference_number}
          citizenName={grievance.citizen_name ?? ""}
          suggestedRecipients={suggestedRecipients}
          resolvedRecipients={resolvedRecipients}
          grievanceDepartment={grievance.department}
          grievanceSubDepartment={grievance.sub_department}
          grievanceOrganization={grievance.organization}
          grievanceOsdCategory={grievance.osd_category ?? grievance.category ?? ""}
        />
      </div>

      <GrievanceJourneyTimeline events={journey} className="lg:col-span-3" />
    </div>
  );
}
