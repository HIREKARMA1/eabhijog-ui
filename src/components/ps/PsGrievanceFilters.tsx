"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
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

function hasActiveFilters(params: Record<string, string>) {
  const { search: _search, page: _page, ...rest } = params;
  return Object.values(rest).some(Boolean);
}

function toLocalISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

/** Resolve quick presets into local calendar From/To values. */
function rangeForPreset(preset: string): { from: string; to: string } | null {
  if (!preset) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const to = toLocalISODate(today);

  switch (preset) {
    case "today":
      return { from: to, to };
    case "yesterday": {
      const y = toLocalISODate(addDays(today, -1));
      return { from: y, to: y };
    }
    case "last_7_days":
      return { from: toLocalISODate(addDays(today, -6)), to };
    case "last_30_days":
      return { from: toLocalISODate(addDays(today, -29)), to };
    default:
      return null;
  }
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2 border-b border-border pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export function PsGrievanceFilters({ basePath, constants: _constants, current }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Record<string, string>>(current);
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (draft.date_from || draft.date_to || draft.date_preset) count += 1;
    if (draft.status) count += 1;
    return count;
  }, [draft]);
  const [showFilters, setShowFilters] = useState(() => hasActiveFilters(current));
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
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    });
  }

  function update(key: string, value: string) {
    const next = { ...draft };
    if (value) next[key] = value;
    else delete next[key];
    delete next.page;
    setDraft(next);
  }

  function applyQuickPreset(preset: string) {
    const next = { ...draft };
    delete next.page;

    if (!preset) {
      delete next.date_preset;
      delete next.date_from;
      delete next.date_to;
      setDraft(next);
      return;
    }

    const range = rangeForPreset(preset);
    if (!range) return;
    next.date_preset = preset;
    next.date_from = range.from;
    next.date_to = range.to;
    setDraft(next);
  }

  function updateDateField(key: "date_from" | "date_to", value: string) {
    const next = { ...draft };
    if (value) next[key] = value;
    else delete next[key];
    delete next.page;

    // Manual calendar picks are always a custom range for the API.
    if (next.date_from || next.date_to) next.date_preset = "custom";
    else delete next.date_preset;

    setDraft(next);
  }

  function resetFilters() {
    setDraft({});
    setSearchDraft("");
    setShowFilters(false);
    startTransition(() => {
      router.replace(basePath, { scroll: false });
    });
  }

  function applyFilters() {
    const next = { ...draft };
    const trimmed = searchDraft.trim();
    if (trimmed) next.search = trimmed;
    else delete next.search;

    // Normalize inverted ranges so Submit always sends a valid window.
    if (next.date_from && next.date_to && next.date_from > next.date_to) {
      const swap = next.date_from;
      next.date_from = next.date_to;
      next.date_to = swap;
    }

    if (next.date_from || next.date_to) {
      next.date_preset = "custom";
    }

    navigate(next);
    setShowFilters(false);
  }

  const quickPresetValue =
    draft.date_preset && draft.date_preset !== "custom" ? draft.date_preset : draft.date_from || draft.date_to ? "custom" : "";

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
          className="relative shrink-0 min-w-28"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
        >
          <Icon name="filter" size={16} />
          {t("ps", "filters.button")}
          {activeFilterCount > 0 ? (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron px-1.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </div>

      {showFilters ? (
        <div className="rounded-2xl border border-border bg-surface-card p-3 shadow-sm sm:p-4">
          <div className="space-y-4">
            <FilterGroup title={t("ps", "filters.sectionDate")}>
              <Input
                disabled={isPending}
                type="date"
                name="date_from"
                label={t("ps", "filters.dateFrom")}
                value={draft.date_from || ""}
                max={draft.date_to || undefined}
                onChange={(e) => updateDateField("date_from", e.target.value)}
                className="w-full py-2"
              />
              <Input
                disabled={isPending}
                type="date"
                name="date_to"
                label={t("ps", "filters.dateTo")}
                value={draft.date_to || ""}
                min={draft.date_from || undefined}
                onChange={(e) => updateDateField("date_to", e.target.value)}
                className="w-full py-2"
              />
              <Select
                disabled={isPending}
                label={t("ps", "filters.quickRange")}
                value={quickPresetValue}
                onChange={(e) => applyQuickPreset(e.target.value)}
                className="w-full"
                options={[
                  { value: "", label: t("ps", "filters.allDates") },
                  { value: "today", label: t("ps", "filters.today") },
                  { value: "yesterday", label: t("ps", "filters.yesterday") },
                  { value: "last_7_days", label: t("ps", "filters.last7Days") },
                  { value: "last_30_days", label: t("ps", "filters.last30Days") },
                  ...(quickPresetValue === "custom"
                    ? [{ value: "custom", label: t("ps", "filters.customRange") }]
                    : []),
                ]}
              />
              <p className="sm:col-span-2 lg:col-span-3 text-xs text-text-muted">
                {t("ps", "filters.dateRangeHint")}
              </p>
            </FilterGroup>

            <FilterGroup title={t("ps", "filters.sectionGrievance")}>
              <Select
                disabled={isPending}
                value={draft.status || ""}
                onChange={(e) => update("status", e.target.value)}
                className="w-full"
                options={[
                  { value: "", label: t("ps", "filters.totalDateWise") },
                  { value: "disposed", label: t("ps", "filters.disposedDateWise") },
                  { value: "pending", label: t("ps", "filters.pendingDateWise") },
                ]}
              />
            </FilterGroup>
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
