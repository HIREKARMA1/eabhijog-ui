"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { PsGrievanceFilters } from "@/components/ps/PsGrievanceFilters";
import { PsGrievanceTable } from "@/components/ps/PsGrievanceTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import type { MetadataConstants, PsGrievanceRow } from "@/types/api";

type Props = {
  items: PsGrievanceRow[];
  total: number;
  constants: MetadataConstants;
  filters: Record<string, string>;
  basePath?: string;
  detailHrefPrefix?: string;
  hideOsdCategory?: boolean;
  title?: string;
  description?: string;
  showHeader?: boolean;
  currentPage?: number;
  pageSize?: number;
};

export function PsGrievancesView({
  items,
  total,
  constants,
  filters,
  basePath = "/ps/grievances",
  detailHrefPrefix = "/ps/grievance/",
  hideOsdCategory = false,
  title,
  description,
  showHeader = true,
  currentPage = 1,
  pageSize = 10,
}: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  function goToPage(page: number) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== "page") next.set(key, value);
    }
    if (page > 1) next.set("page", String(page));
    startTransition(() => {
      router.replace(`${basePath}?${next.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="space-y-4">
      {showHeader ? (
        <PageHeader
          title={title ?? t("ps", "grievances.title")}
          description={description ?? t("ps", "grievances.total", { count: total })}
        />
      ) : null}
      <PsGrievanceFilters
        basePath={basePath}
        constants={constants}
        current={filters}
        hideOsdCategory={hideOsdCategory}
      />
      <div className={cn("relative", isPending && "pointer-events-none opacity-60")}>
        {isPending ? (
          <div className="absolute inset-0 z-10 flex items-start justify-center pt-16">
            <Spinner size="md" />
          </div>
        ) : null}
        <PsGrievanceTable items={items} detailHrefPrefix={detailHrefPrefix} />
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          Showing {from}-{to} of {total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={isPending}
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={isPending}
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
