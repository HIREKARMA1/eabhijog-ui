"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type ChartSlice = {
  key: string;
  label: string;
  count: number;
  href: string;
};

const COLORS = [
  "#ea580c",
  "#0284c7",
  "#059669",
  "#7c3aed",
  "#d97706",
  "#e11d48",
  "#0f766e",
  "#4338ca",
];

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${e.x} ${e.y} A ${r} ${r} 0 ${large} 1 ${s.x} ${s.y} Z`;
}

export function MisPieChart({
  title,
  slices,
  emptyLabel,
  className,
}: {
  title: string;
  slices: ChartSlice[];
  emptyLabel: string;
  className?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const total = useMemo(() => slices.reduce((sum, s) => sum + s.count, 0), [slices]);

  const arcs = useMemo(() => {
    if (!total) return [];
    let angle = 0;
    return slices.map((slice, index) => {
      const span = (slice.count / total) * 360;
      const start = angle;
      const end = angle + Math.max(span, slice.count > 0 ? 0.8 : 0);
      angle = end;
      return { ...slice, start, end, color: COLORS[index % COLORS.length] };
    });
  }, [slices, total]);

  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {!total ? (
        <p className="mt-8 flex-1 text-center text-sm text-text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-3 flex min-h-0 flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center">
          <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0 overflow-visible">
            {arcs.map((arc) => {
              const sweep = arc.end - arc.start;
              if (sweep <= 0) return null;
              const common = {
                fill: arc.color,
                opacity: hover && hover !== arc.key ? 0.45 : 1,
                className: "cursor-pointer transition-opacity",
                onMouseEnter: () => setHover(arc.key),
                onMouseLeave: () => setHover(null),
              };
              return (
                <a key={arc.key} href={arc.href}>
                  {sweep >= 359.9 ? (
                    <circle cx="80" cy="80" r="72" {...common}>
                      <title>
                        {arc.label}: {arc.count}
                      </title>
                    </circle>
                  ) : (
                    <path d={arcPath(80, 80, 72, arc.start, arc.end)} {...common}>
                      <title>
                        {arc.label}: {arc.count}
                      </title>
                    </path>
                  )}
                </a>
              );
            })}
            <circle cx="80" cy="80" r="34" fill="white" />
            <text x="80" y="76" textAnchor="middle" className="fill-slate-500 text-[10px]">
              Total
            </text>
            <text x="80" y="94" textAnchor="middle" className="fill-slate-900 text-sm font-semibold">
              {total}
            </text>
          </svg>
          <ul className="w-full space-y-1.5">
            {arcs.map((arc) => (
              <li key={arc.key}>
                <Link
                  href={arc.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-slate-50",
                    hover === arc.key && "bg-slate-50",
                  )}
                  onMouseEnter={() => setHover(arc.key)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: arc.color }} />
                  <span className="min-w-0 flex-1 truncate text-slate-700">{arc.label}</span>
                  <span className="font-semibold tabular-nums text-slate-900">{arc.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function MisBarChart({
  title,
  slices,
  emptyLabel,
  className,
}: {
  title: string;
  slices: ChartSlice[];
  emptyLabel: string;
  className?: string;
}) {
  const max = Math.max(...slices.map((s) => s.count), 1);

  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {!slices.length ? (
        <p className="mt-8 flex-1 text-center text-sm text-text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-4 flex flex-1 flex-col justify-evenly gap-3">
          {slices.map((slice, index) => (
            <Link key={slice.key} href={slice.href} className="block min-w-0 group">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate font-medium text-slate-700 group-hover:text-navy-700">
                  {slice.label}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-slate-900">{slice.count}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full max-w-full rounded-full transition-all group-hover:brightness-110"
                  style={{
                    width: `${Math.max((slice.count / max) * 100, slice.count ? 4 : 0)}%`,
                    background: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MisTrendChart({
  title,
  slices,
  emptyLabel,
  action,
  className,
}: {
  title: string;
  slices: ChartSlice[];
  emptyLabel: string;
  action?: ReactNode;
  className?: string;
}) {
  const max = Math.max(...slices.map((s) => s.count), 1);
  const dense = slices.length > 10;

  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {!slices.length ? (
        <p className="mt-8 text-center text-sm text-text-muted">{emptyLabel}</p>
      ) : (
        <div className={cn("mt-3 flex h-44 items-end", dense ? "gap-px sm:gap-0.5" : "gap-1 sm:gap-2")}>
          {slices.map((slice) => {
            const pct = slice.count ? Math.max((slice.count / max) * 100, 6) : 0;
            return (
              <Link
                key={slice.key}
                href={slice.href}
                title={`${slice.label}: ${slice.count}`}
                className="flex h-full min-w-0 flex-1 flex-col items-center gap-1 no-underline"
              >
                <span
                  className={cn(
                    "shrink-0 font-semibold tabular-nums text-slate-700",
                    dense ? "text-[8px] sm:text-[10px]" : "text-[10px]",
                  )}
                >
                  {slice.count}
                </span>
                <span className="flex min-h-0 w-full flex-1 items-end justify-center">
                  <span
                    className={cn(
                      "w-full rounded-t-md bg-sky-600 transition hover:opacity-80",
                      dense ? "max-w-3 sm:max-w-4" : "max-w-8",
                    )}
                    style={{ height: `${pct}%`, minHeight: slice.count ? 4 : 0 }}
                  />
                </span>
                <span
                  className={cn(
                    "w-full shrink-0 truncate text-center text-slate-500",
                    dense ? "text-[8px] sm:text-[10px]" : "text-[10px]",
                  )}
                >
                  {slice.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
