"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  fetchIntelligenceCandidates,
  type IntelligenceCandidate,
} from "@/lib/api/ps-intelligence";

import { intelCard } from "./intelligence-styles";

export function PsIntelligenceCandidates({
  queue,
  channel,
}: {
  queue?: string;
  channel?: string;
}) {
  const [rows, setRows] = useState<IntelligenceCandidate[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const params: Record<string, string> = { status: "new" };
    if (queue) params.queue = queue;
    if (channel) params.channel = channel;
    fetchIntelligenceCandidates(params)
      .then((res) => setRows(res.data ?? []))
      .catch((err: Error) => setError(err.message));
  }, [queue, channel]);

  if (error) {
    return <p className="text-sm font-medium text-red-700">{error}</p>;
  }

  return (
    <div className={`overflow-hidden ${intelCard} !p-0`}>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase text-text-muted">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Channel</th>
            <th className="px-4 py-3">District</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-text-muted">
                No items in this queue.{" "}
                <Link
                  href="/ps/intelligence/jobs"
                  className="font-semibold text-navy-700 underline underline-offset-2 hover:text-saffron"
                >
                  Collect clips first →
                </Link>
              </td>
            </tr>
          ) : (
            rows.map((c) => (
              <tr key={c.id} className="border-b border-border/60 hover:bg-surface-muted/60">
                <td className="px-4 py-3 font-medium text-slate-900">{c.title || "—"}</td>
                <td className="px-4 py-3 text-slate-700">{c.source}</td>
                <td className="px-4 py-3 capitalize text-slate-700">{c.channel || "-"}</td>
                <td className="px-4 py-3 text-slate-700">{c.district || "—"}</td>
                <td className="px-4 py-3 text-slate-700">{Math.round((c.confidence ?? 0) * 100)}%</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/ps/intelligence/candidates/${c.id}`}
                    className="inline-flex items-center rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-600"
                  >
                    Review →
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
