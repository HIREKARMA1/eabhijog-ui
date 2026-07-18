"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  fetchIntelligenceIncident,
  type IntelligenceCandidate,
  type IntelligenceIncident,
} from "@/lib/api/ps-intelligence";

import { SectionLoader } from "@/components/ui/Spinner";

import { intelCard, intelLink, intelMuted } from "./intelligence-styles";

export function PsIntelligenceIncidentDetail({ id }: { id: number }) {
  const [incident, setIncident] = useState<IntelligenceIncident | null>(null);
  const [candidates, setCandidates] = useState<IntelligenceCandidate[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIntelligenceIncident(id)
      .then((res) => {
        setIncident(res.incident);
        setCandidates(res.candidates ?? []);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) {
    return <p className="text-sm font-medium text-red-700">{error}</p>;
  }

  if (!incident) {
    return <SectionLoader label="Loading incident…" />;
  }

  return (
    <div className="space-y-6">
      <Link href="/ps/intelligence/incidents" className={intelLink}>
        ← Back to incidents
      </Link>

      <div className={intelCard}>
        <h2 className="text-lg font-semibold text-slate-900">{incident.title}</h2>
        <p className={`mt-2 ${intelMuted}`}>
          {incident.district || "Odisha"} · {incident.severity || "unknown"} · {incident.status}
        </p>
        {incident.summary ? (
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-800">{incident.summary}</p>
        ) : null}
      </div>

      <div className={intelCard}>
        <h3 className="text-sm font-semibold uppercase text-text-muted">
          Linked clips ({candidates.length})
        </h3>
        <ul className="mt-3 divide-y divide-border">
          {candidates.length === 0 ? (
            <li className="py-4 text-sm text-text-muted">No linked candidates.</li>
          ) : (
            candidates.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{c.title || c.summary || "Untitled"}</p>
                  <p className="text-xs text-text-muted">
                    {c.source} · {c.channel} · {c.district || "-"}
                  </p>
                </div>
                <Link
                  href={`/ps/intelligence/candidates/${c.id}`}
                  className="inline-flex items-center rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-600"
                >
                  Review →
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
