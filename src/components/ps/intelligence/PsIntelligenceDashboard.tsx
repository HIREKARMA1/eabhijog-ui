"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Section } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/LinkButton";
import {
  fetchIntelligenceDashboard,
  type IntelligenceDashboard,
} from "@/lib/api/ps-intelligence";

import { SectionLoader } from "@/components/ui/Spinner";

import { IntelligencePageIntro } from "./IntelligencePageIntro";
import { intelCard, intelLink } from "./intelligence-styles";

export function PsIntelligenceDashboard() {
  const [data, setData] = useState<IntelligenceDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIntelligenceDashboard()
      .then((res) => setData(res as IntelligenceDashboard))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!data) {
    return <SectionLoader label="Loading briefing…" />;
  }

  const { kpi } = data;
  const pendingReview = kpi.transport_total ?? 0;

  return (
    <div className="space-y-6">
      <IntelligencePageIntro
        title="Press Intelligence"
        description="Commerce & Transport clips from e-papers, citizen scans, and WhatsApp. Start with Step 1 below, then review and push to the PS grievance desk."
        action={
          pendingReview > 0 ? (
            <LinkButton href="/ps/intelligence/candidates">
              Review {pendingReview} clip{pendingReview === 1 ? "" : "s"} →
            </LinkButton>
          ) : (
            <LinkButton href="/ps/intelligence/jobs">Collect clips →</LinkButton>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pages processed", kpi.pages_processed],
          ["Transport clips", kpi.transport_total],
          ["WhatsApp mirrored", kpi.whatsapp_mirrored ?? 0],
          ["Quick review", kpi.quick],
        ].map(([label, value]) => (
          <div key={label} className={intelCard}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <Section title="Recent clips" className={intelCard}>
        <ul className="divide-y divide-border">
          {data.recent.length === 0 ? (
            <li className="py-4 text-sm text-text-muted">
              No clips yet.{" "}
              <Link href="/ps/intelligence/jobs" className={intelLink}>
                Go to Jobs → upload a PDF or run e-papers
              </Link>
            </li>
          ) : (
            data.recent.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{c.title || c.summary || "Untitled"}</p>
                  <p className="text-xs text-text-muted">
                    {c.source} · {c.district || "—"} · {Math.round((c.confidence ?? 0) * 100)}%
                  </p>
                </div>
                <Link href={`/ps/intelligence/candidates/${c.id}`} className={intelLink}>
                  Review →
                </Link>
              </li>
            ))
          )}
        </ul>
        {data.recent.length > 0 ? (
          <div className="mt-4 border-t border-border pt-4">
            <LinkButton href="/ps/intelligence/candidates" variant="outline">
              Open full review queue
            </LinkButton>
          </div>
        ) : null}
      </Section>
    </div>
  );
}
