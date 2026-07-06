"use client";

import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/lib/i18n/context";
import type { MetadataConstants } from "@/types/api";

type Props = {
  basePath: string;
  constants: MetadataConstants;
  current: Record<string, string>;
  hideOsdCategory?: boolean;
};

export function PsGrievanceFilters({ basePath, constants, current, hideOsdCategory = false }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const isCustomRange = current.date_preset === "custom";

  function navigate(next: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function update(key: string, value: string) {
    const next = { ...current };
    if (value) next[key] = value;
    else delete next[key];

    if (key === "date_preset" && value !== "custom") {
      delete next.date_from;
      delete next.date_to;
    }

    navigate(next);
  }

  function statusLabel(bucket: string): string {
    const translated = t("ps", `statusBuckets.${bucket}`);
    return translated === `statusBuckets.${bucket}` ? bucket.replace(/_/g, " ") : translated;
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-muted/50 p-4">
      <div className="flex flex-wrap gap-3">
        <Select
          value={current.date_preset || ""}
          onChange={(e) => update("date_preset", e.target.value)}
          className="min-w-[140px]"
          options={[
            { value: "", label: t("ps", "filters.allDates") },
            { value: "today", label: t("ps", "filters.today") },
            { value: "yesterday", label: t("ps", "filters.yesterday") },
            { value: "last_7_days", label: t("ps", "filters.last7Days") },
            { value: "last_30_days", label: t("ps", "filters.last30Days") },
            { value: "custom", label: t("ps", "filters.customRange") },
          ]}
        />
        {isCustomRange ? (
          <>
            <Input
              type="date"
              name="date_from"
              value={current.date_from || ""}
              onChange={(e) => update("date_from", e.target.value)}
              className="min-w-[140px] py-2"
              aria-label="From date"
            />
            <Input
              type="date"
              name="date_to"
              value={current.date_to || ""}
              onChange={(e) => update("date_to", e.target.value)}
              className="min-w-[140px] py-2"
              aria-label="To date"
            />
          </>
        ) : null}
        <Select
          value={current.category || ""}
          onChange={(e) => update("category", e.target.value)}
          className="min-w-[160px]"
          options={[
            { value: "", label: t("ps", "filters.allCategories") },
            ...constants.grievance_categories.map((c) => ({ value: c, label: c })),
          ]}
        />
        {!hideOsdCategory ? (
          <Select
            value={current.osd_category || ""}
            onChange={(e) => update("osd_category", e.target.value)}
            className="min-w-[160px]"
            options={[
              { value: "", label: t("ps", "filters.allOsds") },
              ...constants.osd_categories.map((c) => ({ value: c, label: `OSD ${c}` })),
            ]}
          />
        ) : null}
        <Select
          value={current.status || ""}
          onChange={(e) => update("status", e.target.value)}
          className="min-w-[160px]"
          options={[
            { value: "", label: t("ps", "filters.allStatuses") },
            ...constants.ps_status_buckets.map((s) => ({
              value: s,
              label: statusLabel(s),
            })),
          ]}
        />
        <Select
          value={current.district || ""}
          onChange={(e) => update("district", e.target.value)}
          className="min-w-[140px]"
          options={[
            { value: "", label: t("ps", "filters.allDistricts") },
            ...constants.districts.map((d) => ({ value: d, label: d })),
          ]}
        />
        <Select
          value={current.constituency || ""}
          onChange={(e) => update("constituency", e.target.value)}
          className="min-w-[140px]"
          options={[
            { value: "", label: t("ps", "filters.allConstituencies") },
            ...constants.constituencies.map((c) => ({ value: c, label: c })),
          ]}
        />
        <Select
          value={current.department || ""}
          onChange={(e) => update("department", e.target.value)}
          className="min-w-[160px]"
          options={[
            { value: "", label: t("ps", "filters.allDepartments") },
            ...(constants.departments ?? []).map((d) => ({ value: d, label: d })),
          ]}
        />
        <Select
          value={current.priority || ""}
          onChange={(e) => update("priority", e.target.value)}
          className="min-w-[120px]"
          options={[
            { value: "", label: t("ps", "filters.allPriorities") },
            { value: "critical", label: t("ps", "filters.critical") },
            { value: "high", label: t("ps", "filters.high") },
            { value: "high_priority", label: t("ps", "filters.highPriority") },
            { value: "medium", label: t("ps", "filters.medium") },
            { value: "low", label: t("ps", "filters.low") },
          ]}
        />
        <Select
          value={current.overdue || ""}
          onChange={(e) => update("overdue", e.target.value)}
          className="min-w-[140px]"
          options={[
            { value: "", label: t("ps", "filters.allCases") },
            { value: "true", label: t("ps", "filters.overdueOnly") },
          ]}
        />
      </div>
    </div>
  );
}
