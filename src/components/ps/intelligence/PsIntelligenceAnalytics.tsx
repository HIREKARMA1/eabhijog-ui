"use client";

import { useEffect, useState } from "react";

import { fetchIntelligenceAnalytics, type IntelligenceAnalytics } from "@/lib/api/ps-intelligence";

import { IntelligencePageIntro } from "./IntelligencePageIntro";
import { intelCard, intelMuted } from "./intelligence-styles";

export function PsIntelligenceAnalytics() {
  const [data, setData] = useState<IntelligenceAnalytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIntelligenceAnalytics()
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-sm font-medium text-red-700">{error}</p>;
  }

  if (!data) {
    return <p className={intelMuted}>Loading analytics...</p>;
  }

  const dept = data.department ?? {};
  const quality = data.quality ?? {};
  const categories = Object.entries(dept.by_category ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <IntelligencePageIntro
        title="Analytics"
        description="Transport department health, district hotspots, and category breakdown. Optional reporting view."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Department health", `${dept.score ?? "-"} / 100`],
          ["Open incidents", String(dept.pending ?? 0)],
          ["Resolved", String(dept.resolved ?? 0)],
          ["Avg confidence", `${quality.avg_confidence_pct ?? 0}%`],
        ].map(([label, value]) => (
          <div key={label} className={intelCard}>
            <p className="text-xs font-semibold uppercase text-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <section className={intelCard}>
        <h2 className="text-lg font-semibold text-slate-900">District hotspots</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-text-muted">
              <tr>
                <th className="pb-2 pr-4">District</th>
                <th className="pb-2 pr-4">Clips</th>
                <th className="pb-2 pr-4">Pending</th>
                <th className="pb-2 pr-4">Critical</th>
              </tr>
            </thead>
            <tbody>
              {(data.districts ?? []).slice(0, 15).map((row) => (
                <tr key={row.district} className="border-t border-border/60">
                  <td className="py-2 pr-4 font-medium text-slate-900">{row.district}</td>
                  <td className="py-2 pr-4 text-slate-700">{row.complaints}</td>
                  <td className="py-2 pr-4 text-slate-700">{row.pending}</td>
                  <td className="py-2 pr-4 text-slate-700">{row.critical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={intelCard}>
        <h2 className="text-lg font-semibold text-slate-900">Transport categories</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {categories.length === 0 ? (
            <li className="text-text-muted">No category breakdown yet.</li>
          ) : (
            categories.map(([name, count]) => (
              <li key={name} className="flex justify-between gap-4 border-b border-border/60 py-2">
                <span className="capitalize text-slate-700">{name.replace(/_/g, " ")}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      {(data.alerts ?? []).length > 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-amber-950">Active alerts</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            {data.alerts!.map((alert, idx) => (
              <li key={idx}>{alert.title || alert.message || JSON.stringify(alert)}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
