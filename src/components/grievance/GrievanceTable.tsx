"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { useI18n } from "@/lib/i18n/context";
import type { GrievanceRow } from "@/types/api";

type GrievanceTableProps = {
  rows: GrievanceRow[];
  /** Base path for detail links, e.g. `/dashboard/grievance/` or `/osd/slug/grievance/` */
  detailHrefPrefix: string;
};

export function GrievanceTable({ rows, detailHrefPrefix }: GrievanceTableProps) {
  const { t } = useI18n();

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>{t("dashboard", "table.reference")}</TableHeaderCell>
          <TableHeaderCell>{t("dashboard", "table.district")}</TableHeaderCell>
          <TableHeaderCell>{t("dashboard", "table.category")}</TableHeaderCell>
          <TableHeaderCell>{t("dashboard", "table.status")}</TableHeaderCell>
          <TableHeaderCell>{t("dashboard", "table.actions")}</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell>
              <span className="text-text-muted">{t("dashboard", "table.empty")}</span>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.reference_number}>
              <TableCell>
                <span className="font-semibold text-navy-700">{row.reference_number}</span>
              </TableCell>
              <TableCell>{row.district ?? row.geographic_district ?? "—"}</TableCell>
              <TableCell>{row.category ?? row.osd_category ?? "—"}</TableCell>
              <TableCell>
                <Badge tone="info">{row.status_label ?? row.status}</Badge>
              </TableCell>
              <TableCell>
                <Link
                  href={`${detailHrefPrefix}${encodeURIComponent(row.reference_number)}`}
                  className="text-sm font-semibold text-saffron hover:text-saffron-hover"
                >
                  {t("dashboard", "table.view")}
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
