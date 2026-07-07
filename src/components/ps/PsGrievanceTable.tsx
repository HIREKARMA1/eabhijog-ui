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

export function PsGrievanceTable({
  items,
  detailHrefPrefix = "/ps/grievance/",
}: {
  items: PsGrievanceRow[];
  detailHrefPrefix?: string;
}) {
  const { t } = useI18n();

  return (
    <DataTable
      rows={items}
      rowKey={(g) => g.reference_number}
      emptyMessage={t("dashboard", "table.empty")}
      columns={[
        {
          key: "id",
          header: t("ps", "grievances.table.grievanceId"),
          cell: (g) => <span className="font-mono text-xs">{g.reference_number}</span>,
        },
        {
          key: "citizen",
          header: t("ps", "grievances.table.citizenName"),
          cell: (g) => cell(g.citizen_name),
        },
        {
          key: "category",
          header: t("ps", "grievances.table.category"),
          cell: (g) => cell(g.category),
        },
        {
          key: "district",
          header: t("ps", "grievances.table.district"),
          cell: (g) => cell(g.district),
        },
        {
          key: "osd",
          header: t("ps", "grievances.table.assignedOsd"),
          cell: (g) => cell(g.assigned_osd || g.osd_category),
        },
        {
          key: "status",
          header: t("ps", "grievances.table.currentStatus"),
          cell: (g) => <Badge>{formatStatusLabel(g.status)}</Badge>,
        },
        {
          key: "priority",
          header: t("ps", "grievances.table.priority"),
          cell: (g) => <span className="capitalize">{g.priority}</span>,
        },
        {
          key: "daysPending",
          header: t("ps", "grievances.table.daysPending"),
          cell: (g) => formatDaysPending(g.created_at, g.status),
        },
        {
          key: "updated",
          header: t("ps", "grievances.table.lastUpdated"),
          cell: (g) => <span className="text-xs">{formatDateTime(g.updated_at)}</span>,
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
  );
}
