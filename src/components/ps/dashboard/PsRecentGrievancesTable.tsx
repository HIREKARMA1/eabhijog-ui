"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { useI18n } from "@/lib/i18n/context";
import type { PsGrievanceRow } from "@/types/api";

export function PsRecentGrievancesTable({ items }: { items: PsGrievanceRow[] }) {
  const { t } = useI18n();

  return (
    <DataTable
      rows={items}
      rowKey={(g) => g.reference_number}
      emptyMessage={t("ps", "recent.empty")}
      columns={[
        {
          key: "id",
          header: t("dashboard", "table.reference"),
          cell: (g) => <span className="font-mono text-xs">{g.reference_number}</span>,
        },
        {
          key: "citizen",
          header: t("dashboard", "grievance.citizen"),
          cell: (g) => g.citizen_name,
        },
        {
          key: "category",
          header: t("dashboard", "table.category"),
          cell: (g) => g.category,
        },
        {
          key: "district",
          header: t("dashboard", "table.district"),
          cell: (g) => g.district ?? "—",
        },
        {
          key: "status",
          header: t("dashboard", "table.status"),
          cell: (g) => <Badge>{g.status.replace(/_/g, " ")}</Badge>,
        },
        {
          key: "priority",
          header: t("dashboard", "table.priority"),
          cell: (g) => g.priority,
        },
        {
          key: "action",
          header: "",
          cell: (g) => (
            <Link
              href={`/ps/grievance/${g.reference_number}`}
              className="text-sm font-medium text-link hover:underline"
            >
              {t("ps", "recent.open")}
            </Link>
          ),
        },
      ]}
    />
  );
}
