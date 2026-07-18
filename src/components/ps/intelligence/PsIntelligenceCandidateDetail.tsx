"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import {
  fetchIntelligenceCandidate,
  intelligencePageImageUrl,
  updateIntelligenceCandidate,
  type IntelligenceCandidate,
} from "@/lib/api/ps-intelligence";
import { useIntelligenceManage } from "@/hooks/use-intelligence-access";
import { SectionLoader } from "@/components/ui/Spinner";

import { intelCard, intelLink, intelMuted } from "./intelligence-styles";

export function PsIntelligenceCandidateDetail({ id }: { id: number }) {
  const { canManage, loading: accessLoading } = useIntelligenceManage();
  const [candidate, setCandidate] = useState<IntelligenceCandidate | null>(null);
  const [title, setTitle] = useState("");
  const [en, setEn] = useState("");
  const [district, setDistrict] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIntelligenceCandidate(id)
      .then((res) => {
        setCandidate(res.data);
        setTitle(res.data.title || "");
        setEn(res.data.grievance_text_en || res.data.grievance_text || "");
        setDistrict(res.data.district || "");
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  async function act(action: string) {
    setMessage("");
    setError("");
    try {
      const res = await updateIntelligenceCandidate(id, {
        title,
        grievance_text_en: en,
        district,
        action,
      });
      setCandidate(res.data);
      setMessage(`Action: ${res.action}`);
      if (res.data.chatbot_reference) {
        setMessage(`Pushed as ${res.data.chatbot_reference}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (error && !candidate) {
    return <p className="text-sm font-medium text-red-700">{error}</p>;
  }

  if (!candidate) {
    return <SectionLoader label="Loading…" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/ps/intelligence/candidates" className={intelLink}>
          ← Back to review queue
        </Link>
        {candidate.chatbot_reference ? (
          <LinkButton href={`/ps/grievance/${candidate.chatbot_reference}`} variant="outline">
            Open in PS desk →
          </LinkButton>
        ) : null}
      </div>

      <div className="rounded-xl border border-navy-700/20 bg-blue-50 p-4 text-sm text-slate-800">
        <p className="font-semibold text-slate-900">What to do here</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Check title, briefing text, and district against the evidence image.</li>
          <li>
            <strong>Approve</strong> — mark as reviewed without creating a ticket.
          </li>
          <li>
            <strong>Push to grievances</strong> — create a PS desk ticket (Step 3).
          </li>
          <li>
            <strong>Reject</strong> — not Commerce &amp; Transport or duplicate.
          </li>
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className={`space-y-4 ${intelCard}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {candidate.source} · {candidate.channel || "epaper"} · page {candidate.page_number ?? "-"} ·{" "}
            {Math.round((candidate.confidence ?? 0) * 100)}% confidence
          </p>
          {(candidate.channel === "whatsapp" || candidate.source === "jana_samadhan") && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Citizen WhatsApp ticket mirrored to this Transport desk (linked to Jana Samadhan).
            </p>
          )}
          <label className="block text-sm font-medium text-slate-900">
            Title
            <input
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-slate-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-900">
            Briefing text (English)
            <textarea
              className="mt-1 min-h-40 w-full rounded-lg border border-border bg-white px-3 py-2 text-slate-900"
              value={en}
              onChange={(e) => setEn(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-900">
            District
            <input
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-slate-900"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </label>
          {candidate.odia_excerpt ? (
            <div>
              <p className="text-xs font-semibold uppercase text-text-muted">Odia excerpt</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{candidate.odia_excerpt}</p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {canManage && !accessLoading ? (
              <>
                <Button type="button" onClick={() => act("approve")}>
                  Approve
                </Button>
                <Button type="button" variant="secondary" onClick={() => act("push")}>
                  {candidate.chatbot_reference && candidate.channel === "whatsapp"
                    ? "Mark reviewed"
                    : "Push to grievances"}
                </Button>
                <Button type="button" variant="outline" onClick={() => act("save")}>
                  Save draft
                </Button>
                <Button type="button" variant="danger" onClick={() => act("reject")}>
                  Reject
                </Button>
              </>
            ) : (
              <p className={intelMuted}>Read-only access (OSD briefing view).</p>
            )}
          </div>
          {message ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
              {message}
            </p>
          ) : null}
          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
          {candidate.chatbot_reference ? (
            <p className="text-sm text-slate-700">
              Jana ticket:{" "}
              <Link href={`/ps/grievance/${candidate.chatbot_reference}`} className={intelLink}>
                {candidate.chatbot_reference}
              </Link>
            </p>
          ) : null}
        </div>
        <div className={intelCard}>
          <p className="mb-2 text-xs font-semibold uppercase text-text-muted">Evidence</p>
          {candidate.page_number ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={intelligencePageImageUrl(id)}
              alt="Press clipping"
              className="max-h-[70vh] w-full rounded-lg border border-border object-contain"
            />
          ) : (
            <p className={intelMuted}>No page image (WhatsApp mirror or text-only).</p>
          )}
        </div>
      </div>
    </div>
  );
}
