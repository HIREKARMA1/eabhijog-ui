"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type Props = {
  name: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
};

type Parts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => ({
  value: month,
  label: new Date(2024, month, 1).toLocaleDateString("en-IN", { month: "short" }),
}));

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1).padStart(2, "0"),
}));

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, "0"),
}));

const AMPM_OPTIONS = [
  { value: 0, label: "AM" },
  { value: 1, label: "PM" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseDateTimeLocal(value: string | undefined | null): Parts | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const probe = new Date(year, month, day, hour, minute);
  if (Number.isNaN(probe.getTime())) return null;
  return { year, month, day, hour, minute };
}

function toDateTimeLocal(parts: Parts) {
  return `${parts.year}-${pad(parts.month + 1)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

function partsFromDate(d: Date): Parts {
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

function toDate(parts: Parts) {
  return new Date(parts.year, parts.month, parts.day, parts.hour, parts.minute);
}

function sameDay(a: Parts, b: { year: number; month: number; day: number }) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1, 12);
}

function formatDisplay(value: string) {
  const parts = parseDateTimeLocal(value);
  if (!parts) return "";
  return toDate(parts).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function to12Hour(hour24: number) {
  const ampm = hour24 >= 12 ? 1 : 0;
  const hour12 = hour24 % 12 || 12;
  return { hour12, ampm };
}

function to24Hour(hour12: number, ampm: number) {
  if (ampm === 0) return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function MiniSelect({
  value,
  options,
  ariaLabel,
  onChange,
  wide,
}: {
  value: number;
  options: Array<{ value: number; label: string }>;
  ariaLabel: string;
  onChange: (value: number) => void;
  wide?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [open, value]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-between gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-white",
          wide ? "min-w-17" : "min-w-13",
        )}
      >
        <span>{selected?.label}</span>
        <span className="text-[10px] text-slate-500" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute left-0 z-30 mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg",
            wide ? "min-w-18" : "min-w-14",
          )}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-active={active ? "true" : undefined}
                  className={cn(
                    "flex w-full px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                    active ? "bg-navy-700 text-white" : "text-slate-700 hover:bg-slate-50",
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function DateTimePicker({
  name,
  value: controlledValue,
  defaultValue = "",
  required,
  disabled,
  placeholder = "Select date and time",
  className,
  onChange,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = isControlled ? controlledValue : uncontrolled;
  const [open, setOpen] = useState(false);

  const selected = parseDateTimeLocal(value);
  const [draft, setDraft] = useState<Parts>(() => selected ?? partsFromDate(new Date()));
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(draft.year, draft.month),
  );

  useEffect(() => {
    if (!open) return;
    const next = selected ?? partsFromDate(new Date());
    setDraft(next);
    setViewMonth(startOfMonth(next.year, next.month));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- sync draft only when opening

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const viewed = viewMonth.getFullYear();
    const minYear = Math.min(current - 1, viewed, draft.year);
    const maxYear = Math.max(current + 5, viewed, draft.year);
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
      value: minYear + i,
      label: String(minYear + i),
    }));
  }, [viewMonth, draft.year]);

  const days = useMemo(() => {
    const first = startOfMonth(viewMonth.getFullYear(), viewMonth.getMonth());
    const startOffset = first.getDay();
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);
      day.setHours(12, 0, 0, 0);
      return day;
    });
  }, [viewMonth]);

  const { hour12, ampm } = to12Hour(draft.hour);
  const display = value ? formatDisplay(value) : "";
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  function commit(next: Parts | null) {
    const nextValue = next ? toDateTimeLocal(next) : "";
    if (!isControlled) setUncontrolled(nextValue);
    onChange?.(nextValue);
  }

  function applyDraft() {
    commit(draft);
    setOpen(false);
  }

  function selectDay(day: Date) {
    setDraft((prev) => ({
      ...prev,
      year: day.getFullYear(),
      month: day.getMonth(),
      day: day.getDate(),
    }));
  }

  function setToday() {
    const now = partsFromDate(new Date());
    setDraft(now);
    setViewMonth(startOfMonth(now.year, now.month));
  }

  function clearValue() {
    commit(null);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm transition-colors",
          "hover:border-slate-300 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20",
          disabled && "cursor-not-allowed opacity-60",
          !display && "text-slate-400",
        )}
      >
        <span className="truncate">{display || placeholder}</span>
        <span className="shrink-0 text-slate-400" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose date and time"
          className="absolute left-0 right-0 z-40 mt-1.5 w-full max-w-[17rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl sm:right-auto"
        >
          <div className="bg-navy-700 px-2.5 py-1.5 text-white">
            <p className="text-[9px] font-medium uppercase tracking-wide text-white/70">
              Selected
            </p>
            <p className="text-sm font-semibold leading-tight">
              {toDate(draft).toLocaleString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              <span className="ml-1.5 font-medium text-white/85">
                {toDate(draft).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>

          <div className="px-2 pb-1.5 pt-1.5">
            <div className="mb-1 flex items-center justify-between gap-1">
              <div className="flex min-w-0 items-center gap-1">
                <MiniSelect
                  ariaLabel="Month"
                  value={viewMonth.getMonth()}
                  options={MONTH_OPTIONS}
                  onChange={(month) =>
                    setViewMonth(new Date(viewMonth.getFullYear(), month, 1, 12))
                  }
                />
                <MiniSelect
                  ariaLabel="Year"
                  value={viewMonth.getFullYear()}
                  options={years}
                  onChange={(year) =>
                    setViewMonth(new Date(year, viewMonth.getMonth(), 1, 12))
                  }
                  wide
                />
              </div>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label="Previous month"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-navy-700 hover:bg-slate-100"
                  onClick={() =>
                    setViewMonth(
                      new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1, 12),
                    )
                  }
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-navy-700 hover:bg-slate-100"
                  onClick={() =>
                    setViewMonth(
                      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1, 12),
                    )
                  }
                >
                  ›
                </button>
              </div>
            </div>

            <div className="mb-0.5 grid grid-cols-7">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day) => {
                const inMonth = day.getMonth() === viewMonth.getMonth();
                const isSelected = sameDay(draft, {
                  year: day.getFullYear(),
                  month: day.getMonth(),
                  day: day.getDate(),
                });
                const isToday =
                  day.getFullYear() === today.getFullYear() &&
                  day.getMonth() === today.getMonth() &&
                  day.getDate() === today.getDate();

                return (
                  <button
                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={cn(
                      "relative flex h-6 items-center justify-center text-[11px] transition-colors",
                      !inMonth && "text-slate-300",
                      inMonth && !isSelected && "text-slate-800",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full",
                        isSelected && "bg-navy-700 font-semibold text-white",
                        !isSelected && isToday && "ring-1 ring-navy-700",
                        !isSelected && inMonth && "hover:bg-slate-100",
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-1.5 border-t border-slate-100 pt-1.5">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Time
              </p>
              <div className="flex items-center gap-1.5">
                <MiniSelect
                  ariaLabel="Hour"
                  value={hour12}
                  options={HOUR_OPTIONS}
                  onChange={(h) =>
                    setDraft((prev) => ({ ...prev, hour: to24Hour(h, ampm) }))
                  }
                />
                <span className="text-xs font-semibold text-slate-400">:</span>
                <MiniSelect
                  ariaLabel="Minute"
                  value={draft.minute}
                  options={MINUTE_OPTIONS}
                  onChange={(m) => setDraft((prev) => ({ ...prev, minute: m }))}
                  wide
                />
                <MiniSelect
                  ariaLabel="AM or PM"
                  value={ampm}
                  options={AMPM_OPTIONS}
                  onChange={(nextAmpm) =>
                    setDraft((prev) => ({
                      ...prev,
                      hour: to24Hour(to12Hour(prev.hour).hour12, nextAmpm),
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-1.5">
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-navy-700 hover:bg-slate-50"
                  onClick={setToday}
                >
                  Now
                </button>
                {!required ? (
                  <button
                    type="button"
                    className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
                    onClick={clearValue}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-md bg-navy-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-navy-600"
                onClick={applyDraft}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
