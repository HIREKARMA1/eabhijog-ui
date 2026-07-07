"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
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
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Record<string, string>>(current);
  const isCustomRange = draft.date_preset === "custom";
  const hasAdvancedFilters = useMemo(
    () =>
      Boolean(
        draft.district ||
          draft.constituency ||
          draft.department ||
          draft.priority ||
          draft.overdue ||
          draft.osd_category ||
          draft.date_from ||
          draft.date_to,
      ),
    [draft],
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchDraft, setSearchDraft] = useState(current.search ?? "");

  useEffect(() => {
    setDraft(current);
  }, [current]);

  useEffect(() => {
    setSearchDraft(current.search ?? "");
  }, [current.search]);

  useEffect(() => {
    const trimmed = searchDraft.trim();
    const currentTerm = (current.search ?? "").trim();
    if (trimmed === currentTerm) return;

    const timer = window.setTimeout(() => {
      const next = { ...current };
      if (trimmed) next.search = trimmed;
      else delete next.search;
      delete next.page;
      navigate(next);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchDraft, current]);

  function navigate(next: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    startTransition(() => {
      router.replace(`${basePath}?${params.toString()}`);
    });
  }

  function update(key: string, value: string) {
    const next = { ...draft };
    if (value) next[key] = value;
    else delete next[key];
    delete next.page;

    if (key === "date_preset" && value !== "custom") {
      delete next.date_from;
      delete next.date_to;
    }

    if (key === "date_preset" && value === "custom") {
      setShowFilters(true);
    }

    setDraft(next);
  }

  function resetFilters() {
    setDraft({});
    setSearchDraft("");
    setShowFilters(false);
    startTransition(() => {
      router.replace(basePath);
    });
  }

  function applyFilters() {
    const next = { ...draft };
    const trimmed = searchDraft.trim();
    if (trimmed) next.search = trimmed;
    else delete next.search;
    navigate(next);
    setShowFilters(false);
  }

  function statusLabel(bucket: string): string {
    const translated = t("ps", `statusBuckets.${bucket}`);
    return translated === `statusBuckets.${bucket}` ? bucket.replace(/_/g, " ") : translated;
  }

  return (
    <div className="space-y-3" aria-busy={isPending}>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <svg
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            disabled={isPending}
            type="search"
            name="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t("ps", "filters.searchPlaceholder")}
            aria-label={t("ps", "filters.searchLabel")}
            className="w-full py-2 pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="shrink-0 min-w-28"
          onClick={() => setShowFilters((v) => !v)}
        >
          <Icon name="filter" size={16} />
          {t("ps", "filters.button")}
        </Button>
      </div>

      {showFilters ? (
        <div className="rounded-2xl border border-border bg-surface-card p-3 shadow-sm sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Select
              disabled={isPending}
              value={draft.date_preset || ""}
              onChange={(e) => update("date_preset", e.target.value)}
              className="w-full"
              options={[
                { value: "", label: t("ps", "filters.allDates") },
                { value: "today", label: t("ps", "filters.today") },
                { value: "yesterday", label: t("ps", "filters.yesterday") },
                { value: "last_7_days", label: t("ps", "filters.last7Days") },
                { value: "last_30_days", label: t("ps", "filters.last30Days") },
                { value: "custom", label: t("ps", "filters.customRange") },
              ]}
            />
            <Select
              disabled={isPending}
              value={draft.category || ""}
              onChange={(e) => update("category", e.target.value)}
              className="w-full"
              options={[
                { value: "", label: t("ps", "filters.allCategories") },
                ...constants.grievance_categories.map((c) => ({ value: c, label: c })),
              ]}
            />
            {!hideOsdCategory ? (
              <Select
                disabled={isPending}
                value={draft.osd_category || ""}
                onChange={(e) => update("osd_category", e.target.value)}
                className="w-full"
                options={[
                  { value: "", label: t("ps", "filters.allOsds") },
                  ...constants.osd_categories.map((c) => ({ value: c, label: `OSD ${c}` })),
                ]}
              />
            ) : null}
            <Select
              disabled={isPending}
              value={draft.status || ""}
              onChange={(e) => update("status", e.target.value)}
              className="w-full"
              options={[
                { value: "", label: t("ps", "filters.allStatuses") },
                ...constants.ps_status_buckets.map((s) => ({
                  value: s,
                  label: statusLabel(s),
                })),
              ]}
            />
            {isCustomRange ? (
              <>
                <Input
                  disabled={isPending}
                  type="date"
                  name="date_from"
                  value={draft.date_from || ""}
                  onChange={(e) => update("date_from", e.target.value)}
                  className="w-full py-2"
                  aria-label="From date"
                />
                <Input
                  disabled={isPending}
                  type="date"
                  name="date_to"
                  value={draft.date_to || ""}
                  onChange={(e) => update("date_to", e.target.value)}
                  className="w-full py-2"
                  aria-label="To date"
                />
              </>
            ) : null}
            <Select
              disabled={isPending}
              value={draft.district || ""}
              onChange={(e) => update("district", e.target.value)}
              className="w-full"
              options={[
                { value: "", label: t("ps", "filters.allDistricts") },
                ...constants.districts.map((d) => ({ value: d, label: d })),
              ]}
            />
            <Select
              disabled={isPending}
              value={draft.constituency || ""}
              onChange={(e) => update("constituency", e.target.value)}
              className="w-full"
              options={[
                { value: "", label: t("ps", "filters.allConstituencies") },
                ...constants.constituencies.map((c) => ({ value: c, label: c })),
              ]}
            />
            <Select
              disabled={isPending}
              value={draft.department || ""}
              onChange={(e) => update("department", e.target.value)}
              className="w-full"
              options={[
                { value: "", label: t("ps", "filters.allDepartments") },
                ...(constants.departments ?? []).map((d) => ({ value: d, label: d })),
              ]}
            />
            <Select
              disabled={isPending}
              value={draft.priority || ""}
              onChange={(e) => update("priority", e.target.value)}
              className="w-full"
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
              disabled={isPending}
              value={draft.overdue || ""}
              onChange={(e) => update("overdue", e.target.value)}
              className="w-full"
              options={[
                { value: "", label: t("ps", "filters.allCases") },
                { value: "true", label: t("ps", "filters.overdueOnly") },
              ]}
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              disabled={isPending && Object.keys(current).length === 0}
            >
              {t("ps", "filters.reset")}
            </Button>
            <Button type="button" size="sm" onClick={applyFilters} disabled={isPending}>
              {t("common", "actions.submit")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
