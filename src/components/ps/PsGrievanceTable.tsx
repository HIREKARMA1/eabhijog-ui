"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { reopenOsdGrievance, reopenPsGrievance } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import {
  cell,
  formatDateTime,
  formatDaysPending,
  formatStatusLabel,
} from "@/lib/grievance/display";
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

function daysPendingClass(days: string) {
  if (days === "-") return "bg-slate-100 text-slate-600";
  const count = Number(days);
  if (count >= 7) return "bg-red-50 text-red-700 ring-1 ring-red-100";
  if (count >= 3) return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
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
}: {
  items: PsGrievanceRow[];
  detailHrefPrefix?: string;
  listQueryString?: string;
  listMode?: "active" | "disposed" | "reverted";
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [reopeningRef, setReopeningRef] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const osdSlug = extractOsdSlug(detailHrefPrefix);
  const isRevertedList = listMode === "reverted";

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
            disabled={reopeningRef === g.reference_number}
            onClick={() => handleReopen(g.reference_number)}
          >
            {t("ps", "grievances.table.reopen")}
          </Button>
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
            const days = formatDaysPending(g.created_at, g.status);
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

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-text-muted">{t("ps", "grievances.table.daysPending")}</p>
                      <span className={`mt-1 inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${daysPendingClass(days)}`}>
                        {days}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-text-muted">{t("ps", "grievances.table.lastUpdated")}</p>
                      <p className="mt-1 font-medium text-slate-700">{formatDateTime(g.updated_at)}</p>
                    </div>
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
              key: "daysPending",
              header: t("ps", "grievances.table.daysPending"),
              cell: (g) => {
                const days = formatDaysPending(g.created_at, g.status);
                return (
                  <span className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${daysPendingClass(days)}`}>
                    {days}
                  </span>
                );
              },
            },
            {
              key: "updated",
              header: t("ps", "grievances.table.lastUpdated"),
              cell: (g) => <span className="text-xs text-slate-600">{formatDateTime(g.updated_at)}</span>,
            },
            {
              key: "actions",
              header: t("ps", "grievances.table.actions"),
              cell: (g) => actionCell(g),
            },
          ]}
        />
      </div>
    </>
  );
}
