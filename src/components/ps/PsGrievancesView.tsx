"use client";

import { PsGrievanceFilters } from "@/components/ps/PsGrievanceFilters";
import { PsGrievanceTable } from "@/components/ps/PsGrievanceTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/context";
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
}: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <PageHeader
        title={title ?? t("ps", "grievances.title")}
        description={description ?? t("ps", "grievances.total", { count: total })}
      />
      <PsGrievanceFilters
        basePath={basePath}
        constants={constants}
        current={filters}
        hideOsdCategory={hideOsdCategory}
      />
      <PsGrievanceTable items={items} detailHrefPrefix={detailHrefPrefix} />
    </div>
  );
}
