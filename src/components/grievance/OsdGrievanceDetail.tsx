"use client";

import { FormEvent, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/icons/Icon";
import { GrievanceAttachments } from "@/components/grievance/GrievanceAttachments";
import { GrievanceListBackLink } from "@/components/grievance/GrievanceListBackLink";
import { OsdForwardForm } from "@/components/grievance/OsdForwardForm";
import { WhatsAppThread } from "@/components/grievance/WhatsAppThread";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { reopenOsdGrievance, updateOsdStatus, osdWhatsAppReply, deleteOsdGrievance } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import {
  CITIZEN_WHATSAPP_MAX_CHARS,
  citizenWhatsAppLengthError,
  isStatusMessageStatus,
} from "@/lib/grievance/statusMessageTemplates";
import {
  filterOsdUpdateStatusOptions,
  formatOsdStatusOptionLabel,
  formatPriorityLabel,
  formatStatusLabel,
} from "@/lib/grievance/display";
import { ExpandableText } from "@/components/grievance/ExpandableText";
import { useI18n } from "@/lib/i18n/context";
import type { GrievanceConversationData, GrievanceRow, OsdDepartmentContact } from "@/types/api";

type OsdGrievanceDetailProps = {
  osdSlug: string;
  grievance: GrievanceRow;
  allowedStatuses: string[];
  priorities: string[];
  suggestedRecipients: OsdDepartmentContact[];
  resolvedRecipients: OsdDepartmentContact[];
  conversation?: GrievanceConversationData | null;
  isSuperAdmin?: boolean;
};

export function OsdGrievanceDetailView({
  osdSlug,
  grievance,
  allowedStatuses,
  priorities,
  suggestedRecipients,
  resolvedRecipients,
  conversation,
  isSuperAdmin = false,
}: OsdGrievanceDetailProps) {
  const { t } = useI18n();
  const router = useRouter();
  const isReverted = grievance.status === "reverted";
  const forwardRef = useRef<HTMLDivElement>(null);
  const [threadHeight, setThreadHeight] = useState<number>();
  const [status, setStatus] = useState(grievance.status);
  const [priority, setPriority] = useState(grievance.priority ?? "normal");
  const [citizenMessage, setCitizenMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "warning">("success");

  const statusOptions = useMemo(
    () => filterOsdUpdateStatusOptions(allowedStatuses, grievance.status),
    [allowedStatuses, grievance.status],
  );

  const showCitizenMessage = isStatusMessageStatus(status) && !isReverted;

  useLayoutEffect(() => {
    if (isReverted) {
      setThreadHeight(undefined);
      return;
    }
    const source = forwardRef.current;
    if (!source) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      if (!desktop.matches) {
        setThreadHeight(undefined);
        return;
      }
      setThreadHeight(Math.round(source.getBoundingClientRect().height));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(source);
    desktop.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, [isReverted, suggestedRecipients, resolvedRecipients]);

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

  async function onReopen() {
    setFeedback("");
    setLoading(true);
    try {
      const result = await reopenOsdGrievance(osdSlug, grievance.reference_number);
      setFeedbackTone("success");
      setFeedback(result.message || "Grievance reopened for pending review.");
      router.refresh();
    } catch (err) {
      setFeedbackTone("warning");
      setFeedback(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    const confirmed = window.confirm(
      t("dashboard", "grievance.deleteConfirm", { ref: grievance.reference_number }),
    );
    if (!confirmed) return;
    setFeedback("");
    setDeleting(true);
    try {
      await deleteOsdGrievance(osdSlug, grievance.reference_number);
      router.push(`/osd/${osdSlug}/grievances`);
      router.refresh();
    } catch (err) {
      setFeedbackTone("warning");
      setFeedback(err instanceof ApiError ? err.message : t("common", "errors.generic"));
      setDeleting(false);
    }
  }

  const statusCardClassName = "flex h-full w-full flex-col";

  const statusCard = isReverted ? (
    <Card title={t("dashboard", "grievance.reopenTitle")} className={statusCardClassName}>
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mb-3 text-sm text-text-muted">
          {grievance.can_reopen
            ? t("dashboard", "grievance.reopenReadyHint")
            : t("dashboard", "grievance.reopenWaitingHint")}
        </p>
        <div className="mt-auto space-y-3">
          <Button
            type="button"
            className="w-full"
            loading={loading}
            disabled={loading || !grievance.can_reopen}
            onClick={onReopen}
          >
            {t("dashboard", "grievance.reopen")}
          </Button>
          {feedback ? (
            <p
              className={`text-sm ${
                feedbackTone === "success" ? "text-success" : "text-amber-700"
              }`}
            >
              {feedback}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  ) : (
    <Card title={t("dashboard", "grievance.updateStatus")} className={statusCardClassName}>
      <form onSubmit={onStatusSubmit} className="flex min-h-0 flex-1 flex-col gap-3">
        <Select
          label={t("dashboard", "table.status")}
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          options={statusOptions.map((s) => ({
            value: s,
            label: formatOsdStatusOptionLabel(s),
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
        <div className="mt-auto space-y-3">
          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            {t("dashboard", "grievance.updateStatus")}
          </Button>
          {feedback ? (
            <p
              className={`text-sm ${
                feedbackTone === "success" ? "text-success" : "text-amber-700"
              }`}
            >
              {feedback}
            </p>
          ) : null}
        </div>
      </form>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        {isSuperAdmin ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={deleting}
            disabled={deleting || loading}
            onClick={onDelete}
          >
            <span className="inline-flex items-center gap-1.5">
              <Icon name="trash" size={16} />
              {t("dashboard", "grievance.delete")}
            </span>
          </Button>
        ) : (
          <span />
        )}
        <GrievanceListBackLink
          listHref={`/osd/${osdSlug}/grievances`}
          disposedListHref={`/osd/${osdSlug}/disposed-grievances`}
          revertedListHref={`/osd/${osdSlug}/reverted-grievances`}
          label={t("dashboard", "grievance.backToList")}
          asButton
          align="end"
        />
      </div>

      <div className="grid gap-5 [grid-template-areas:'details'_'thread'_'status'_'forward'] lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-stretch lg:[grid-template-areas:'details_status'_'thread_forward']">
        <div className="flex h-full min-h-0 min-w-0 [grid-area:details]">
          <Card title={grievance.reference_number} className="flex h-full w-full flex-col">
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
                <dt className="text-text-muted">{t("dashboard", "table.status")}</dt>
                <dd>{formatStatusLabel(grievance.status)}</dd>
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
              <div className="space-y-3 sm:col-span-2">
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
        </div>

        <div
          className="min-w-0 overflow-hidden [grid-area:thread] lg:self-start"
          style={threadHeight ? { height: threadHeight } : undefined}
        >
          {conversation ? (
            <WhatsAppThread
              data={conversation}
              fillHeight={Boolean(threadHeight)}
              onWhatsAppReply={(message) =>
                osdWhatsAppReply(osdSlug, grievance.reference_number, message).then(() => undefined)
              }
            />
          ) : (
            <Card title="WhatsApp Conversation" className={threadHeight ? "h-full" : undefined}>
              <p className="text-sm text-text-muted">No messages recorded yet.</p>
            </Card>
          )}
        </div>

        <div className="flex h-full min-h-0 min-w-0 [grid-area:status]">{statusCard}</div>

        {!isReverted ? (
          <div id="osd-forward-form" ref={forwardRef} className="min-w-0 scroll-mt-4 [grid-area:forward] lg:self-start">
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
        ) : null}
      </div>
    </div>
  );
}
