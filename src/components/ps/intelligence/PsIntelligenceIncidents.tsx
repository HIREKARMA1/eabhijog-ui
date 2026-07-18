"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchIntelligenceIncidents, type IntelligenceIncident } from "@/lib/api/ps-intelligence";
import { SectionLoader } from "@/components/ui/Spinner";

import { IntelligencePageIntro } from "./IntelligencePageIntro";
import { intelCard } from "./intelligence-styles";

export function PsIntelligenceIncidents() {
  const [rows, setRows] = useState<IntelligenceIncident[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [highCount, setHighCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntelligenceIncidents()
      .then((res) => {
        setRows(res.incidents ?? []);
        setOpenCount(res.open_count ?? 0);
        setHighCount(res.high_count ?? 0);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return <p className="text-sm font-medium text-red-700">{error}</p>;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <IntelligencePageIntro
          title="Incidents"
          description="Grouped Transport issues from multiple clips. Optional — use after reviewing the main queue."
        />
        <div className={intelCard}>
          <SectionLoader label="Loading incidents…" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IntelligencePageIntro
        title="Incidents"
        description="Grouped Transport issues from multiple clips. Optional — use after reviewing the main queue."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={intelCard}>
          <p className="text-xs font-semibold uppercase text-text-muted">Open incidents</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{openCount}</p>
        </div>
        <div className={intelCard}>
          <p className="text-xs font-semibold uppercase text-text-muted">High severity</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{highCount}</p>
        </div>
      </div>

      <div className={`overflow-hidden ${intelCard} !p-0`}>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">Sources</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-muted">
                  No incidents yet. Run e-paper analysis or mirror WhatsApp tickets.
                </td>
              </tr>
            ) : (
              rows.map((inc) => (
                <tr key={inc.id} className="border-b border-border/60 hover:bg-surface-muted/60">
                  <td className="px-4 py-3 font-medium text-slate-900">{inc.title || `Incident #${inc.id}`}</td>
                  <td className="px-4 py-3 text-slate-700">{inc.district || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{inc.source_count ?? 0}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{inc.severity || "-"}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{inc.status || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/ps/intelligence/incidents/${inc.id}`}
                      className="inline-flex items-center rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-600"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
