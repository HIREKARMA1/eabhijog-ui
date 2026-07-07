"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
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
  return "default" as const;
}

function priorityTone(priority: string) {
  if (priority === "urgent" || priority === "critical" || priority === "high") return "danger" as const;
  if (priority === "normal" || priority === "medium") return "info" as const;
  return "default" as const;
}

function daysPendingClass(days: string) {
  if (days === "—") return "bg-slate-100 text-slate-600";
  const count = Number(days);
  if (count >= 7) return "bg-red-50 text-red-700 ring-1 ring-red-100";
  if (count >= 3) return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
}

export function PsGrievanceTable({
  items,
  detailHrefPrefix = "/ps/grievance/",
}: {
  items: PsGrievanceRow[];
  detailHrefPrefix?: string;
}) {
  const { t } = useI18n();

  return (
    <>
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
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    {g.reference_number}
                  </span>
                  <Link
                    href={`${detailHrefPrefix}${encodeURIComponent(g.reference_number)}`}
                    className="inline-flex shrink-0 items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    {t("ps", "grievances.table.view")}
                  </Link>
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
              cell: (g) => <span className="font-mono text-xs font-semibold text-slate-800">{g.reference_number}</span>,
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
              cell: (g) => (
                <Link
                  href={`${detailHrefPrefix}${encodeURIComponent(g.reference_number)}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {t("ps", "grievances.table.view")}
                </Link>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
