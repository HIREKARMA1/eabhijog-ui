"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/lib/i18n/context";

type DateMode = "all" | "today" | "yesterday" | "last_7_days" | "last_30_days" | "custom";

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

function rangeForMode(mode: Exclude<DateMode, "all" | "custom">): { from: string; to: string } {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const to = toLocalISODate(today);
  switch (mode) {
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
      return { from: to, to };
  }
}

function detectDateMode(params: URLSearchParams): DateMode {
  const preset = params.get("date_preset");
  if (
    preset === "today" ||
    preset === "yesterday" ||
    preset === "last_7_days" ||
    preset === "last_30_days"
  ) {
    return preset;
  }
  if (params.get("date_from") || params.get("date_to") || preset === "custom") {
    return "custom";
  }
  return "all";
}

type GrievanceFiltersProps = {
  statuses: string[];
  districts: string[];
  categories: string[];
  osdCategories: string[];
  basePath: string;
  variant?: "portal" | "desk";
  hideOsdCategory?: boolean;
};

export function GrievanceFilters({
  statuses,
  districts,
  categories,
  osdCategories,
  basePath,
  variant = "portal",
  hideOsdCategory = false,
}: GrievanceFiltersProps) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const isDesk = variant === "desk";

  const [status, setStatus] = useState(params.get("status") ?? "");
  const [district, setDistrict] = useState(params.get("district") ?? "");
  const [filingSource, setFilingSource] = useState(params.get("filing_source") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [osdCategory, setOsdCategory] = useState(params.get("osd_category") ?? "");
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [dateMode, setDateMode] = useState<DateMode>(() => detectDateMode(params));
  const [dateFrom, setDateFrom] = useState(params.get("date_from") ?? "");
  const [dateTo, setDateTo] = useState(params.get("date_to") ?? "");

  useEffect(() => {
    setStatus(params.get("status") ?? "");
    setDistrict(params.get("district") ?? "");
    setFilingSource(params.get("filing_source") ?? "");
    setCategory(params.get("category") ?? "");
    setOsdCategory(params.get("osd_category") ?? "");
    setSearch(params.get("search") ?? "");
    setDateMode(detectDateMode(params));
    setDateFrom(params.get("date_from") ?? "");
    setDateTo(params.get("date_to") ?? "");
  }, [params]);

  const deskStatusOptions = useMemo(
    () => [
      { value: "", label: t("ps", "filters.totalDateWise") },
      { value: "disposed", label: t("ps", "filters.disposedDateWise") },
      { value: "pending", label: t("ps", "filters.pendingDateWise") },
    ],
    [t],
  );

  const portalStatusOptions = useMemo(
    () => [
      { value: "", label: "-" },
      ...statuses.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
    ],
    [statuses],
  );

  const datePresetOptions = useMemo(
    () => [
      { value: "all", label: t("ps", "filters.allDates") },
      { value: "today", label: t("ps", "filters.today") },
      { value: "yesterday", label: t("ps", "filters.yesterday") },
      { value: "last_7_days", label: t("ps", "filters.last7Days") },
      { value: "last_30_days", label: t("ps", "filters.last30Days") },
      { value: "custom", label: t("ps", "filters.customRange") },
    ],
    [t],
  );

  function appendDateParams(qs: URLSearchParams) {
    if (!isDesk || dateMode === "all") return;

    if (dateMode === "custom") {
      if (dateFrom) qs.set("date_from", dateFrom);
      if (dateTo) qs.set("date_to", dateTo);
      if (dateFrom || dateTo) qs.set("date_preset", "custom");
      return;
    }

    qs.set("date_preset", dateMode);
    const range = rangeForMode(dateMode);
    qs.set("date_from", range.from);
    qs.set("date_to", range.to);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (district) qs.set("district", district);
    if (filingSource) qs.set("filing_source", filingSource);
    if (category) qs.set("category", category);
    if (!hideOsdCategory && osdCategory) qs.set("osd_category", osdCategory);
    if (search.trim()) qs.set("search", search.trim());
    appendDateParams(qs);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    router.push(`${basePath}${suffix}`);
  }

  function onClear() {
    setStatus("");
    setDistrict("");
    setFilingSource("");
    setCategory("");
    setOsdCategory("");
    setSearch("");
    setDateMode("all");
    setDateFrom("");
    setDateTo("");
    router.push(basePath);
  }

  function onDateModeChange(value: string) {
    const mode = (value || "all") as DateMode;
    setDateMode(mode);
    if (mode === "all") {
      setDateFrom("");
      setDateTo("");
      return;
    }
    if (mode === "custom") return;
    const range = rangeForMode(mode);
    setDateFrom(range.from);
    setDateTo(range.to);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-xl border border-border bg-white p-4"
    >
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        <Select
          name="status"
          label={t("dashboard", "filters.status")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={isDesk ? deskStatusOptions : portalStatusOptions}
        />
        <Select
          name="district"
          label={t("dashboard", "filters.district")}
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          options={[{ value: "", label: "-" }, ...districts.map((d) => ({ value: d, label: d }))]}
        />
        <Select
          name="filing_source"
          label={t("dashboard", "filters.source")}
          value={filingSource}
          onChange={(e) => setFilingSource(e.target.value)}
          options={[
            { value: "", label: "-" },
            { value: "chatbot", label: t("dashboard", "filters.sourceChatbot") },
            { value: "online_hearing", label: t("dashboard", "filters.sourceOnlineHearing") },
          ]}
        />
        <Select
          name="category"
          label={t("dashboard", "filters.category")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[{ value: "", label: "-" }, ...categories.map((c) => ({ value: c, label: c }))]}
        />
        {!hideOsdCategory ? (
          <Select
            name="osd_category"
            label={t("dashboard", "filters.osdCategory")}
            value={osdCategory}
            onChange={(e) => setOsdCategory(e.target.value)}
            options={[
              { value: "", label: "-" },
              ...osdCategories.map((c) => ({ value: c, label: c })),
            ]}
          />
        ) : null}
        <Input
          name="search"
          label={t("dashboard", "filters.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-end gap-2 md:col-span-2 lg:col-span-1">
          <Button type="submit" className="flex-1">
            {t("dashboard", "filters.apply")}
          </Button>
          <Button type="button" variant="outline" onClick={onClear}>
            {t("dashboard", "filters.clear")}
          </Button>
        </div>
      </div>

      {isDesk ? (
        <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3 lg:grid-cols-4">
          <Select
            name="date_preset"
            label={t("ps", "filters.sectionDate")}
            value={dateMode}
            onChange={(e) => onDateModeChange(e.target.value)}
            options={datePresetOptions}
          />
          {dateMode === "custom" ? (
            <>
              <Input
                name="date_from"
                type="date"
                label={t("ps", "filters.dateFrom")}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                name="date_to"
                type="date"
                label={t("ps", "filters.dateTo")}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
