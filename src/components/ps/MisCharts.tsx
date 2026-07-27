"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
}: {
  title: string;
  slices: ChartSlice[];
  emptyLabel: string;
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
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {!total ? (
        <p className="mt-8 text-center text-sm text-text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0">
            {arcs.map((arc) => (
              <a key={arc.key} href={arc.href}>
                <path
                  d={arcPath(80, 80, 72, arc.start, arc.end)}
                  fill={arc.color}
                  opacity={hover && hover !== arc.key ? 0.45 : 1}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHover(arc.key)}
                  onMouseLeave={() => setHover(null)}
                >
                  <title>
                    {arc.label}: {arc.count}
                  </title>
                </path>
              </a>
            ))}
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
}: {
  title: string;
  slices: ChartSlice[];
  emptyLabel: string;
}) {
  const max = Math.max(...slices.map((s) => s.count), 1);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {!slices.length ? (
        <p className="mt-8 text-center text-sm text-text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {slices.map((slice, index) => (
            <Link key={slice.key} href={slice.href} className="block group">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-slate-700 group-hover:text-navy-700">
                  {slice.label}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-slate-900">{slice.count}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all group-hover:brightness-110"
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
}: {
  title: string;
  slices: ChartSlice[];
  emptyLabel: string;
}) {
  const max = Math.max(...slices.map((s) => s.count), 1);
  const height = 120;
  const width = Math.max(slices.length * 28, 280);
  const barW = 16;

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {!slices.some((s) => s.count > 0) ? (
        <p className="mt-8 text-center text-sm text-text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height + 28}`} className="min-w-full" style={{ height: height + 28 }}>
            {slices.map((slice, index) => {
              const h = slice.count ? Math.max((slice.count / max) * height, 3) : 0;
              const x = index * 28 + 6;
              const y = height - h;
              return (
                <a key={slice.key} href={slice.href}>
                  <g className="cursor-pointer">
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={h}
                      rx={4}
                      fill={COLORS[1]}
                      className="hover:opacity-80"
                    >
                      <title>
                        {slice.label}: {slice.count}
                      </title>
                    </rect>
                    <text
                      x={x + barW / 2}
                      y={height + 14}
                      textAnchor="middle"
                      className="fill-slate-500 text-[8px]"
                    >
                      {slice.label.replace(/ .*/, "")}
                    </text>
                  </g>
                </a>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
