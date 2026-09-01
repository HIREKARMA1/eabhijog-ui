"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { DateRangeCalendar } from "@/components/ps/DateRangeCalendar";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import type { MetadataConstants } from "@/types/api";

type Props = {
  basePath: string;
  constants: MetadataConstants;
  current: Record<string, string>;
  hideOsdCategory?: boolean;
};

type FilterStep = "date" | "grievance" | "type";
type DateMode = "all" | "today" | "yesterday" | "last_7_days" | "last_30_days" | "calendar";

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

function rangeForMode(mode: DateMode): { from: string; to: string } | null {
  if (mode === "all" || mode === "calendar") return null;
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
      return null;
  }
}

function detectDateMode(params: Record<string, string>): DateMode {
  const preset = params.date_preset;
  if (preset === "today" || preset === "yesterday" || preset === "last_7_days" || preset === "last_30_days") {
    return preset;
  }
  if (params.date_from || params.date_to || preset === "custom") return "calendar";
  return "all";
}

function formatChipDate(from?: string, to?: string) {
  if (!from && !to) return "";
  if (from && to && from === to) return from;
  if (from && to) return `${from} → ${to}`;
  return from || to || "";
}

function RadioOption({
  checked,
  label,
  onSelect,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
        checked ? "bg-navy-700/5 text-navy-700" : "text-slate-800 hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          checked ? "border-navy-700" : "border-slate-300",
        )}
        aria-hidden
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-navy-700" /> : null}
      </span>
      <span className="min-w-0 flex-1 font-medium leading-snug">{label}</span>
    </button>
  );
}

function FilterModal({
  open,
  title,
  hint,
  onClose,
  children,
  footer,
  size = "sm",
}: {
  open: boolean;
  title: string;
  hint?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  size?: "sm" | "md";
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ps-filter-dialog-title"
        className={cn(
          "relative z-10 flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl",
          size === "sm" ? "max-w-[17.5rem] sm:max-w-xs" : "max-w-[19rem] sm:max-w-sm",
        )}
      >
        <div className="bg-navy-700 px-3 py-2 text-white">
          <p id="ps-filter-dialog-title" className="text-sm font-semibold leading-snug">
            {title}
          </p>
          {hint ? <p className="mt-0.5 text-[11px] leading-snug text-white/75">{hint}</p> : null}
        </div>
        <div className="max-h-[min(55vh,24rem)] overflow-y-auto">{children}</div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2.5">
          {footer}
        </div>
      </div>
    </div>
  );
}

export function PsGrievanceFilters({ basePath, constants, current, hideOsdCategory = false }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [searchDraft, setSearchDraft] = useState(current.search ?? "");
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [step, setStep] = useState<FilterStep>("date");
  const [dateMode, setDateMode] = useState<DateMode>(() => detectDateMode(current));
  const [dateFrom, setDateFrom] = useState(current.date_from ?? "");
  const [dateTo, setDateTo] = useState(current.date_to ?? "");
  const [calendarFrom, setCalendarFrom] = useState(current.date_from ?? "");
  const [calendarTo, setCalendarTo] = useState(current.date_to ?? "");
  const [status, setStatus] = useState(current.status ?? "");
  const [filingSource, setFilingSource] = useState(current.filing_source ?? "");
  const [category, setCategory] = useState(current.category ?? "");
  const [osdCategory, setOsdCategory] = useState(current.osd_category ?? "");

  useEffect(() => {
    setSearchDraft(current.search ?? "");
    setDateMode(detectDateMode(current));
    setDateFrom(current.date_from ?? "");
    setDateTo(current.date_to ?? "");
    setStatus(current.status ?? "");
    setFilingSource(current.filing_source ?? "");
    setCategory(current.category ?? "");
    setOsdCategory(current.osd_category ?? "");
  }, [current]);

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

  function applyInlineFilter(key: "category" | "osd_category", value: string) {
    const next = { ...current };
    if (value) next[key] = value;
    else delete next[key];
    delete next.page;
    if (key === "category") setCategory(value);
    else setOsdCategory(value);
    navigate(next);
  }

  const categoryOptions = useMemo(
    () => [
      { value: "", label: t("ps", "filters.allCategories") },
      ...constants.grievance_categories.map((c) => ({ value: c, label: c })),
    ],
    [constants.grievance_categories, t],
  );

  const osdCategoryOptions = useMemo(
    () => [
      { value: "", label: t("ps", "filters.allOsdCategories") },
      ...constants.osd_categories.map((c) => ({ value: c, label: c })),
    ],
    [constants.osd_categories, t],
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("ps", "filters.totalDateWise") },
      { value: "disposed", label: t("ps", "filters.disposedDateWise") },
      { value: "pending", label: t("ps", "filters.pendingDateWise") },
    ],
    [t],
  );

  const sourceOptions = useMemo(
    () => [
      { value: "", label: t("ps", "filters.sourceAll") },
      { value: "chatbot", label: t("ps", "filters.sourceChatbot") },
      { value: "online_hearing", label: t("ps", "filters.sourceOnlineHearing") },
    ],
    [t],
  );

  const dateOptions = useMemo(
    () => [
      { value: "all" as const, label: t("ps", "filters.allDates") },
      { value: "today" as const, label: t("ps", "filters.today") },
      { value: "yesterday" as const, label: t("ps", "filters.yesterday") },
      { value: "last_7_days" as const, label: t("ps", "filters.last7Days") },
      { value: "last_30_days" as const, label: t("ps", "filters.last30Days") },
      { value: "calendar" as const, label: t("ps", "filters.chooseFromCalendar") },
    ],
    [t],
  );

  const activeDateLabel = useMemo(() => {
    const preset = current.date_preset;
    if (!preset && !current.date_from && !current.date_to) return t("ps", "filters.allDates");
    if (preset === "today") return t("ps", "filters.today");
    if (preset === "yesterday") return t("ps", "filters.yesterday");
    if (preset === "last_7_days") return t("ps", "filters.last7Days");
    if (preset === "last_30_days") return t("ps", "filters.last30Days");
    const custom = formatChipDate(current.date_from, current.date_to);
    return custom || t("ps", "filters.allDates");
  }, [current, t]);

  const activeStatusLabel =
    statusOptions.find((opt) => opt.value === (current.status ?? ""))?.label ??
    t("ps", "filters.totalDateWise");

  const activeSourceLabel =
    sourceOptions.find((opt) => opt.value === (current.filing_source ?? ""))?.label ??
    t("ps", "filters.sourceAll");

  const filterChipLabel = useMemo(() => {
    const parts: string[] = [];
    const hasDate = Boolean(current.date_from || current.date_to || current.date_preset);
    const hasStatus = Boolean(current.status);
    const hasSource = Boolean(current.filing_source);
    const hasCategory = Boolean(current.category);
    const hasOsd = Boolean(current.osd_category) && !hideOsdCategory;

    if (!hasDate && !hasStatus && !hasSource && !hasCategory && !hasOsd) {
      return t("ps", "filters.button");
    }

    if (hasDate) parts.push(activeDateLabel);
    if (hasStatus) parts.push(activeStatusLabel);
    if (hasSource) parts.push(activeSourceLabel);
    if (hasCategory) parts.push(current.category!);
    if (hasOsd) parts.push(current.osd_category!);

    return parts.join(" · ");
  }, [activeDateLabel, activeSourceLabel, activeStatusLabel, current, hideOsdCategory, t]);

  const hasActiveFilters = Boolean(
    current.date_from ||
      current.date_to ||
      current.date_preset ||
      current.status ||
      current.filing_source ||
      current.category ||
      (!hideOsdCategory && current.osd_category),
  );

  const canGoNext =
    dateMode !== "calendar" || Boolean(dateFrom && dateTo && dateFrom <= dateTo);

  const calendarReady = Boolean(calendarFrom && calendarTo && calendarFrom <= calendarTo);

  function openFilters(at: FilterStep = "date") {
    setDateMode(detectDateMode(current));
    setDateFrom(current.date_from ?? "");
    setDateTo(current.date_to ?? "");
    setStatus(current.status ?? "");
    setFilingSource(current.filing_source ?? "");
    setCategory(current.category ?? "");
    setOsdCategory(current.osd_category ?? "");
    setCalendarOpen(false);
    setStep(at);
    setOpen(true);
  }

  function selectDateMode(mode: DateMode) {
    if (mode === "calendar") {
      setDateMode("calendar");
      const today = toLocalISODate(new Date());
      setCalendarFrom(dateFrom || today);
      setCalendarTo(dateTo || dateFrom || today);
      setOpen(false);
      setCalendarOpen(true);
      return;
    }

    setDateMode(mode);
    if (mode === "all") {
      setDateFrom("");
      setDateTo("");
      return;
    }
    const range = rangeForMode(mode);
    if (!range) return;
    setDateFrom(range.from);
    setDateTo(range.to);
  }

  function confirmCalendar() {
    if (!calendarReady) return;
    let from = calendarFrom;
    let to = calendarTo;
    if (from > to) {
      const swap = from;
      from = to;
      to = swap;
    }
    setDateMode("calendar");
    setDateFrom(from);
    setDateTo(to);
    setCalendarOpen(false);
    setOpen(true);
    setStep("grievance");
  }

  function cancelCalendar() {
    setCalendarOpen(false);
    setOpen(true);
    setStep("date");
    if (dateMode === "calendar" && !(dateFrom && dateTo)) {
      setDateMode("all");
    }
  }

  function applyFilters() {
    const next: Record<string, string> = {};
    const trimmed = searchDraft.trim();
    if (trimmed) next.search = trimmed;

    let from = dateFrom;
    let to = dateTo;
    if (from && to && from > to) {
      const swap = from;
      from = to;
      to = swap;
    }

    if (dateMode === "all") {
      // no date params
    } else if (dateMode === "calendar") {
      if (from) next.date_from = from;
      if (to) next.date_to = to;
      if (from || to) next.date_preset = "custom";
    } else {
      next.date_preset = dateMode;
      if (from) next.date_from = from;
      if (to) next.date_to = to;
    }

    if (status) next.status = status;
    if (filingSource) next.filing_source = filingSource;
    if (current.category) next.category = current.category;
    if (!hideOsdCategory && current.osd_category) next.osd_category = current.osd_category;

    navigate(next);
    setOpen(false);
    setCalendarOpen(false);
  }

  function resetFilters() {
    setDateMode("all");
    setDateFrom("");
    setDateTo("");
    setStatus("");
    setFilingSource("");
    setCategory("");
    setOsdCategory("");
    setSearchDraft("");
    setOpen(false);
    setCalendarOpen(false);
    startTransition(() => {
      router.replace(basePath, { scroll: false });
    });
  }

  const weekdayLabels = [
    t("ps", "filters.weekdaySu"),
    t("ps", "filters.weekdayMo"),
    t("ps", "filters.weekdayTu"),
    t("ps", "filters.weekdayWe"),
    t("ps", "filters.weekdayTh"),
    t("ps", "filters.weekdayFr"),
    t("ps", "filters.weekdaySa"),
  ];

  const stepTitle =
    step === "date"
      ? t("ps", "filters.dateStepTitle")
      : step === "grievance"
        ? t("ps", "filters.grievanceStepTitle")
        : t("ps", "filters.typeStepTitle");

  const stepHint =
    step === "date"
      ? t("ps", "filters.dateStepHint")
      : step === "grievance"
        ? t("ps", "filters.grievanceStepHint")
        : t("ps", "filters.typeStepHint");

  return (
    <div className="space-y-3" aria-busy={isPending}>
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-[1.35] space-y-1.5">
          <span className="text-sm font-medium text-slate-700">{t("ps", "filters.searchLabel")}</span>
          <div className="relative">
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
            <input
              disabled={isPending}
              type="search"
              name="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder={t("ps", "filters.searchPlaceholder")}
              aria-label={t("ps", "filters.searchLabel")}
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <Select
            disabled={isPending}
            name="category"
            label={t("ps", "filters.category")}
            value={category}
            onChange={(e) => applyInlineFilter("category", e.target.value)}
            className={category ? "border-navy-700/40 ring-1 ring-navy-700/10" : undefined}
            options={categoryOptions}
          />
        </div>

        {!hideOsdCategory ? (
          <div className="min-w-0 flex-1">
            <Select
              disabled={isPending}
              name="osd_category"
              label={t("ps", "filters.assignedOsd")}
              value={osdCategory}
              onChange={(e) => applyInlineFilter("osd_category", e.target.value)}
              className={osdCategory ? "border-navy-700/40 ring-1 ring-navy-700/10" : undefined}
              options={osdCategoryOptions}
            />
          </div>
        ) : null}

        <div className="flex shrink-0 items-center gap-2 self-end">
          <button
            type="button"
            disabled={isPending}
            onClick={() => openFilters("date")}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            <span className="max-w-[12rem] truncate sm:max-w-none">{filterChipLabel}</span>
            <span aria-hidden className="shrink-0 text-white/80">
              ▾
            </span>
          </button>

          {hasActiveFilters || current.search ? (
            <button
              type="button"
              disabled={isPending}
              onClick={resetFilters}
              className="shrink-0 px-1.5 py-2 text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
            >
              {t("ps", "filters.reset")}
            </button>
          ) : null}
        </div>
      </div>

      <FilterModal
        open={open && !calendarOpen}
        title={stepTitle}
        hint={stepHint}
        onClose={() => setOpen(false)}
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700"
              onClick={() => {
                if (step === "type") setStep("grievance");
                else if (step === "grievance") setStep("date");
                else setOpen(false);
              }}
            >
              {step === "date" ? t("common", "actions.cancel") : t("ps", "filters.back")}
            </button>
            {step === "date" ? (
              <Button
                type="button"
                size="sm"
                disabled={!canGoNext || isPending}
                onClick={() => setStep("grievance")}
              >
                {t("ps", "filters.next")}
              </Button>
            ) : step === "grievance" ? (
              <Button type="button" size="sm" disabled={isPending} onClick={() => setStep("type")}>
                {t("ps", "filters.next")}
              </Button>
            ) : (
              <Button type="button" size="sm" disabled={isPending} onClick={applyFilters}>
                {t("common", "actions.submit")}
              </Button>
            )}
          </>
        }
      >
        {step === "date" ? (
          <div className="divide-y divide-slate-100 py-1">
            {dateOptions.map((opt) => (
              <RadioOption
                key={opt.value}
                checked={dateMode === opt.value}
                label={opt.label}
                onSelect={() => selectDateMode(opt.value)}
              />
            ))}
          </div>
        ) : step === "grievance" ? (
          <div className="divide-y divide-slate-100 py-1">
            {statusOptions.map((opt) => (
              <RadioOption
                key={opt.value || "total"}
                checked={status === opt.value}
                label={opt.label}
                onSelect={() => setStatus(opt.value)}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 py-1">
            {sourceOptions.map((opt) => (
              <RadioOption
                key={opt.value || "all"}
                checked={filingSource === opt.value}
                label={opt.label}
                onSelect={() => setFilingSource(opt.value)}
              />
            ))}
          </div>
        )}
      </FilterModal>

      <FilterModal
        open={calendarOpen}
        title={t("ps", "filters.calendarModalTitle")}
        hint={t("ps", "filters.calendarModalHint")}
        onClose={cancelCalendar}
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700"
              onClick={cancelCalendar}
            >
              {t("common", "actions.cancel")}
            </button>
            <Button type="button" size="sm" disabled={!calendarReady} onClick={confirmCalendar}>
              {t("ps", "filters.ok")}
            </Button>
          </>
        }
      >
        <div className="p-1.5">
          <DateRangeCalendar
            from={calendarFrom}
            to={calendarTo}
            onChange={({ from, to }) => {
              setCalendarFrom(from);
              setCalendarTo(to);
            }}
            labels={{
              from: t("ps", "filters.dateFrom"),
              to: t("ps", "filters.dateTo"),
              weekdays: weekdayLabels,
            }}
          />
        </div>
      </FilterModal>
    </div>
  );
}
