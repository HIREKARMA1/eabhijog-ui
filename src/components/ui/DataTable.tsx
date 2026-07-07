import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-card px-4 py-10 text-center text-sm text-text-muted shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border bg-surface-card shadow-sm",
        className,
      )}
    >
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-violet-200/70 bg-gradient-to-r from-blue-600 to-violet-500 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
            {columns.map((col) => (
              <th key={col.key} className={cn("whitespace-nowrap px-3 py-2.5", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row)}
              className={cn(
                "border-b border-border/80 last:border-0 hover:bg-sky-50/50",
                index % 2 === 0 ? "bg-white" : "bg-slate-50/50",
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("whitespace-nowrap px-3 py-2.5", col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
