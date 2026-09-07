"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils/cn";
import { reopenOsdGrievance, reopenPsGrievance, deleteOsdGrievance } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { cell, formatStatusLabel } from "@/lib/grievance/display";
import { useI18n } from "@/lib/i18n/context";
import type { PsGrievanceRow } from "@/types/api";

function statusTone(status: string) {
  if (status === "resolved" || status === "closed" || status === "action_taken") return "success" as const;
  if (status === "forwarded_to_department" || status === "department_action_pending") return "info" as const;
  if (status === "pending_review" || status === "new") return "warning" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "reverted") return "warning" as const;
  return "default" as const;
}

function priorityTone(priority: string) {
  if (priority === "urgent" || priority === "critical" || priority === "high") return "danger" as const;
  if (priority === "normal" || priority === "medium") return "info" as const;
  return "default" as const;
}

function FilingSourceBadge({
  source,
  label,
}: {
  source?: "chatbot" | "online_hearing";
  label: string;
}) {
  if (!source) return null;
  const tone = source === "online_hearing" ? ("info" as const) : ("default" as const);
  return (
    <Badge tone={tone} className="whitespace-nowrap">
      {label}
    </Badge>
  );
}

function detailHref(
  detailHrefPrefix: string,
  referenceNumber: string,
  listQueryString?: string,
): string {
  const base = `${detailHrefPrefix}${encodeURIComponent(referenceNumber)}`;
  return listQueryString ? `${base}?${listQueryString}` : base;
}

function extractOsdSlug(detailHrefPrefix: string): string | null {
  const match = detailHrefPrefix.match(/^\/osd\/([^/]+)\//);
  return match?.[1] ?? null;
}

export function PsGrievanceTable({
  items,
  detailHrefPrefix = "/ps/grievance/",
  listQueryString,
  listMode = "active",
  sortOldest = false,
  onToggleDateSort,
  isSuperAdmin = false,
}: {
  items: PsGrievanceRow[];
  detailHrefPrefix?: string;
  listQueryString?: string;
  listMode?: "active" | "disposed" | "reverted";
  sortOldest?: boolean;
  onToggleDateSort?: () => void;
  isSuperAdmin?: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [reopeningRef, setReopeningRef] = useState<string | null>(null);
  const [deletingRef, setDeletingRef] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const osdSlug = extractOsdSlug(detailHrefPrefix);
  const isRevertedList = listMode === "reverted";
  const canDelete = Boolean(isSuperAdmin && osdSlug);

  function sourceLabel(source?: "chatbot" | "online_hearing") {
    if (source === "online_hearing") return t("ps", "grievances.table.sourceOnlineHearing");
    if (source === "chatbot") return t("ps", "grievances.table.sourceChatbot");
    return "";
  }

  async function handleReopen(referenceNumber: string) {
    setActionError("");
    setReopeningRef(referenceNumber);
    try {
      if (osdSlug) {
        await reopenOsdGrievance(osdSlug, referenceNumber);
      } else {
        await reopenPsGrievance(referenceNumber);
      }
      router.refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setReopeningRef(null);
    }
  }

  async function handleDelete(referenceNumber: string) {
    if (!osdSlug) return;
    const confirmed = window.confirm(
      t("ps", "grievances.table.deleteConfirm", { ref: referenceNumber }),
    );
    if (!confirmed) return;
    setActionError("");
    setDeletingRef(referenceNumber);
    try {
      await deleteOsdGrievance(osdSlug, referenceNumber);
      router.refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setDeletingRef(null);
    }
  }

  function updateBadge(g: PsGrievanceRow) {
    if (!isRevertedList) return null;
    return (
      <Badge tone={g.can_reopen ? "success" : "warning"}>
        {g.can_reopen
          ? t("ps", "grievances.table.updatedByCitizen")
          : t("ps", "grievances.table.awaitingCitizen")}
      </Badge>
    );
  }

  function actionCell(g: PsGrievanceRow) {
    return (
      <div className="flex flex-col items-start gap-2">
        <Link
          href={detailHref(detailHrefPrefix, g.reference_number, listQueryString)}
          className="text-sm font-medium text-brand hover:underline"
        >
          {t("ps", "grievances.table.view")}
        </Link>
        {isRevertedList && g.can_reopen ? (
          <Button
            type="button"
            variant="outline"
            className="!px-2 !py-1 text-xs"
            loading={reopeningRef === g.reference_number}
            disabled={reopeningRef === g.reference_number || deletingRef === g.reference_number}
            onClick={() => handleReopen(g.reference_number)}
          >
            {t("ps", "grievances.table.reopen")}
          </Button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
            title={t("ps", "grievances.table.delete")}
            aria-label={t("ps", "grievances.table.delete")}
            disabled={deletingRef === g.reference_number || reopeningRef === g.reference_number}
            onClick={() => handleDelete(g.reference_number)}
          >
            <Icon name="trash" size={16} />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {actionError ? <p className="mb-2 text-sm text-amber-700">{actionError}</p> : null}
      <div className="space-y-3 md:hidden">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-card px-4 py-10 text-center text-sm text-text-muted shadow-sm">
            {t("dashboard", "table.empty")}
          </div>
        ) : (
          items.map((g, index) => {
            return (
              <div
                key={g.reference_number}
                className={`rounded-2xl border border-border bg-white p-4 shadow-sm ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                      {g.reference_number}
                    </span>
                    <FilingSourceBadge
                      source={g.filing_source}
                      label={sourceLabel(g.filing_source)}
                    />
                    {updateBadge(g)}
                  </div>
                  {actionCell(g)}
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{cell(g.citizen_name)}</p>
                    <p className="mt-1 text-xs text-text-muted">{cell(g.category)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text-muted">
                    <span>{cell(g.district)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{cell(g.assigned_osd || g.osd_category)}</span>
                    <Badge tone={statusTone(g.status)}>{formatStatusLabel(g.status)}</Badge>
                    <Badge tone={priorityTone(g.priority)}>{g.priority.toUpperCase()}</Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block">
        <DataTable
          rows={items}
          rowKey={(g) => g.reference_number}
          emptyMessage={t("dashboard", "table.empty")}
          columns={[
            {
              key: "id",
              header: t("ps", "grievances.table.grievanceId"),
              cell: (g) => (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-800">{g.reference_number}</span>
                  <FilingSourceBadge
                    source={g.filing_source}
                    label={sourceLabel(g.filing_source)}
                  />
                  {updateBadge(g)}
                </div>
              ),
            },
            {
              key: "citizen",
              header: t("ps", "grievances.table.citizenName"),
              cell: (g) => <span className="font-medium text-slate-800">{cell(g.citizen_name)}</span>,
            },
            {
              key: "category",
              header: t("ps", "grievances.table.category"),
              cell: (g) => <span className="text-slate-700">{cell(g.category)}</span>,
            },
            {
              key: "district",
              header: t("ps", "grievances.table.district"),
              cell: (g) => <span className="text-slate-700">{cell(g.district)}</span>,
            },
            {
              key: "osd",
              header: t("ps", "grievances.table.assignedOsd"),
              cell: (g) => <span className="text-slate-700">{cell(g.assigned_osd || g.osd_category)}</span>,
            },
            {
              key: "status",
              header: t("ps", "grievances.table.currentStatus"),
              cell: (g) => <Badge tone={statusTone(g.status)}>{formatStatusLabel(g.status)}</Badge>,
            },
            {
              key: "priority",
              header: t("ps", "grievances.table.priority"),
              cell: (g) => <Badge tone={priorityTone(g.priority)}>{g.priority.toUpperCase()}</Badge>,
            },
            {
              key: "actions",
              header: (
                <div className="flex items-center justify-end gap-2">
                  <span>{t("ps", "grievances.table.actions")}</span>
                  {onToggleDateSort ? (
                    <button
                      type="button"
                      onClick={onToggleDateSort}
                      title={
                        sortOldest
                          ? t("ps", "grievances.table.sortNewestFirst")
                          : t("ps", "grievances.table.sortOldestFirst")
                      }
                      aria-pressed={sortOldest}
                      className={cn(
                        "inline-flex rounded-md p-1 text-white/90 transition hover:bg-white/20 hover:text-white",
                        sortOldest && "bg-white/25 text-white",
                      )}
                    >
                      <Icon name="calendar-sort" size={16} />
                    </button>
                  ) : null}
                </div>
              ),
              className: "text-right",
              cell: (g) => actionCell(g),
            },
          ]}
        />
      </div>
    </>
  );
}
