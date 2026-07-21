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
  const isCustomRange = draft.date_preset === "custom";
  const activeFilterCount = useMemo(() => {
    const keys = ["date_preset", "date_from", "date_to", "status"];
    return keys.filter((key) => Boolean(draft[key])).length;
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
      router.replace(basePath, { scroll: false });
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
              <Select
                disabled={isPending}
                value={draft.date_preset || ""}
                onChange={(e) => update("date_preset", e.target.value)}
                className="w-full sm:col-span-2 lg:col-span-3"
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
                    disabled={isPending}
                    type="date"
                    name="date_from"
                    label={t("ps", "filters.dateFrom")}
                    value={draft.date_from || ""}
                    onChange={(e) => update("date_from", e.target.value)}
                    className="w-full py-2"
                  />
                  <Input
                    disabled={isPending}
                    type="date"
                    name="date_to"
                    label={t("ps", "filters.dateTo")}
                    value={draft.date_to || ""}
                    onChange={(e) => update("date_to", e.target.value)}
                    className="w-full py-2"
                  />
                </>
              ) : null}
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
