"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  labels: {
    from: string;
    to: string;
    weekdays: string[];
  };
};

function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toLocalISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 12);
}

function addMonths(d: Date, count: number) {
  return new Date(d.getFullYear(), d.getMonth() + count, 1, 12);
}

function formatHeaderDate(d: Date | null, fallback: string) {
  if (!d) return fallback;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => ({
  value: month,
  label: new Date(2024, month, 1).toLocaleDateString(undefined, { month: "short" }),
}));

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
          "inline-flex items-center justify-between gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-white",
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
            "absolute left-0 z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg",
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
                    active
                      ? "bg-navy-700 text-white"
                      : "text-slate-700 hover:bg-slate-50",
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

export function DateRangeCalendar({ from, to, onChange, labels }: Props) {
  const fromDate = parseISODate(from);
  const toDate = parseISODate(to);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(fromDate ?? toDate ?? today),
  );
  const [picking, setPicking] = useState<"from" | "to">(fromDate && !toDate ? "to" : "from");

  const years = useMemo(() => {
    const current = today.getFullYear();
    const viewed = viewMonth.getFullYear();
    const selectedYears = [fromDate?.getFullYear(), toDate?.getFullYear()].filter(
      (y): y is number => typeof y === "number",
    );
    const minYear = Math.min(current - 20, viewed, ...selectedYears, current);
    const maxYear = Math.max(current + 2, viewed, ...selectedYears, current);
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
      value: minYear + i,
      label: String(minYear + i),
    }));
  }, [today, viewMonth, fromDate, toDate]);

  const days = useMemo(() => {
    const first = startOfMonth(viewMonth);
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

  function selectDay(day: Date) {
    const iso = toLocalISODate(day);
    if (picking === "from" || !fromDate || (fromDate && toDate)) {
      onChange({ from: iso, to: "" });
      setPicking("to");
      return;
    }
    if (day < fromDate) {
      onChange({ from: iso, to: toLocalISODate(fromDate) });
      setPicking("from");
      return;
    }
    onChange({ from: toLocalISODate(fromDate), to: iso });
    setPicking("from");
  }

  function setMonth(month: number) {
    setViewMonth(new Date(viewMonth.getFullYear(), month, 1, 12));
  }

  function setYear(year: number) {
    setViewMonth(new Date(year, viewMonth.getMonth(), 1, 12));
  }

  const headerPrimary =
    picking === "to" && fromDate && !toDate
      ? formatHeaderDate(fromDate, labels.from)
      : formatHeaderDate(toDate ?? fromDate, picking === "from" ? labels.from : labels.to);

  return (
    <div className="rounded-lg bg-white">
      <div className="overflow-hidden rounded-t-lg bg-navy-700 px-3 py-2 text-white">
        <p className="text-[10px] font-medium leading-none text-white/75">
          {viewMonth.getFullYear()}
        </p>
        <p className="mt-1 text-base font-semibold leading-tight tracking-tight">{headerPrimary}</p>
        <p className="mt-1 text-[10px] leading-snug text-white/70">
          {picking === "from" ? labels.from : labels.to}
          {fromDate || toDate
            ? ` · ${fromDate ? toLocalISODate(fromDate) : "—"} → ${toDate ? toLocalISODate(toDate) : "—"}`
            : null}
        </p>
      </div>

      <div className="px-2 pb-2 pt-2">
        <div className="mb-1.5 flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <MiniSelect
              ariaLabel="Month"
              value={viewMonth.getMonth()}
              options={MONTH_OPTIONS}
              onChange={setMonth}
            />
            <MiniSelect
              ariaLabel="Year"
              value={viewMonth.getFullYear()}
              options={years}
              onChange={setYear}
              wide
            />
          </div>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              aria-label="Previous month"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm text-navy-700 hover:bg-slate-100"
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next month"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm text-navy-700 hover:bg-slate-100"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
            >
              ›
            </button>
          </div>
        </div>

        <div className="mb-0.5 grid grid-cols-7">
          {labels.weekdays.map((day) => (
            <div
              key={day}
              className="py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const inMonth = day.getMonth() === viewMonth.getMonth();
            const isStart = fromDate ? sameDay(day, fromDate) : false;
            const isEnd = toDate ? sameDay(day, toDate) : false;
            const inRange =
              fromDate && toDate ? day >= fromDate && day <= toDate : false;
            const isToday = sameDay(day, today);

            return (
              <button
                key={toLocalISODate(day)}
                type="button"
                onClick={() => selectDay(day)}
                className={cn(
                  "relative flex h-8 items-center justify-center text-xs transition-colors",
                  !inMonth && "text-slate-300",
                  inMonth && !isStart && !isEnd && "text-slate-800",
                  inRange && !isStart && !isEnd && "bg-navy-700/10",
                  (isStart || isEnd) && "z-1",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full",
                    (isStart || isEnd) && "bg-navy-700 font-semibold text-white",
                    !isStart && !isEnd && isToday && "ring-1 ring-navy-700",
                    !isStart && !isEnd && inMonth && "hover:bg-slate-100",
                  )}
                >
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
