"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { DeleteGrievanceButton } from "@/components/grievance/DeleteGrievanceButton";
import { DownloadPdfMenu } from "@/components/grievance/DownloadPdfMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { ApiError } from "@/lib/api/client";
import { downloadPortalGrievancePdf } from "@/lib/api/portal";
import { useI18n } from "@/lib/i18n/context";
import type { GrievanceRow } from "@/types/api";

type GrievanceTableProps = {
  rows: GrievanceRow[];
  /** Base path for detail links, e.g. `/dashboard/grievance/` or `/osd/slug/grievance/` */
  detailHrefPrefix: string;
};

export function GrievanceTable({ rows, detailHrefPrefix }: GrievanceTableProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  function sourceLabel(source?: "chatbot" | "online_hearing") {
    if (source === "online_hearing") return t("dashboard", "table.sourceOnlineHearing");
    if (source === "chatbot") return t("dashboard", "table.sourceChatbot");
    return "";
  }

  async function onDownload(ref: string) {
    setDownloadError("");
    setDownloading(ref);
    try {
      await downloadPortalGrievancePdf(ref);
    } catch (err) {
      setDownloadError(err instanceof ApiError ? err.message : t("dashboard", "table.downloadFailed"));
    } finally {
      setDownloading(null);
    }
  }

  const visibleRows = rows.filter((row) => !removed.has(row.reference_number));

  return (
    <>
      {downloadError ? <p className="mb-3 text-sm text-danger">{downloadError}</p> : null}
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
          {visibleRows.length === 0 ? (
            <TableRow>
              <TableCell>
                <span className="text-text-muted">{t("dashboard", "table.empty")}</span>
              </TableCell>
            </TableRow>
          ) : (
            visibleRows.map((row) => (
              <TableRow key={row.reference_number}>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy-700">{row.reference_number}</span>
                    {row.filing_source ? (
                      <Badge tone={row.filing_source === "online_hearing" ? "info" : "default"}>
                        {sourceLabel(row.filing_source)}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{row.district ?? row.geographic_district ?? "-"}</TableCell>
                <TableCell>{row.category ?? row.osd_category ?? "-"}</TableCell>
                <TableCell>
                  <Badge tone="info">{row.status_label ?? row.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-nowrap items-center gap-2">
                    <Link
                      href={`${detailHrefPrefix}${encodeURIComponent(row.reference_number)}`}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-150 hover:bg-surface"
                    >
                      {t("dashboard", "table.view")}
                    </Link>
                    <DownloadPdfMenu
                      loading={downloading === row.reference_number}
                      onDownload={() => void onDownload(row.reference_number)}
                    />
                    <span className="mx-0.5 hidden h-4 w-px bg-border sm:inline-block" aria-hidden />
                    <DeleteGrievanceButton
                      referenceNumber={row.reference_number}
                      filingSource={row.filing_source}
                      onDeleted={() => {
                        setRemoved((prev) => {
                          const next = new Set(prev);
                          next.add(row.reference_number);
                          return next;
                        });
                        router.refresh();
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
