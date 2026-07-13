"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LinkButton } from "@/components/ui/LinkButton";
import { PsIntelligenceCandidates } from "@/components/ps/intelligence/PsIntelligenceCandidates";
import { cn } from "@/lib/utils/cn";

import { IntelligencePageIntro } from "./IntelligencePageIntro";
import { intelCard, intelTabActive, intelTabIdle } from "./intelligence-styles";

const FILTERS = [
  { label: "All new", href: "/ps/intelligence/candidates", active: (q?: string, c?: string) => !q && !c },
  { label: "Quick review", href: "/ps/intelligence/candidates?queue=quick", active: (q?: string) => q === "quick" },
  {
    label: "Needs verification",
    href: "/ps/intelligence/candidates?queue=verify",
    active: (q?: string) => q === "verify",
  },
  {
    label: "WhatsApp",
    href: "/ps/intelligence/candidates?channel=whatsapp",
    active: (_q?: string, c?: string) => c === "whatsapp",
  },
  {
    label: "E-paper",
    href: "/ps/intelligence/candidates?channel=epaper",
    active: (_q?: string, c?: string) => c === "epaper",
  },
] as const;

export function PsIntelligenceCandidatesView() {
  const params = useSearchParams();
  const queue = params.get("queue") || undefined;
  const channel = params.get("channel") || undefined;

  return (
    <div className="space-y-6">
      <IntelligencePageIntro
        title="Step 2 — Review queue"
        description="Open each clip, check the text and evidence image, then Approve or Push to grievances. Reject clips that are not Commerce & Transport."
        action={
          <LinkButton href="/ps/grievances" variant="outline">
            Step 3: PS grievances →
          </LinkButton>
        }
      />

      <div className={cn(intelCard, "space-y-3")}>
        <p className="text-sm font-semibold text-slate-900">Filter queue</p>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={f.active(queue, channel) ? intelTabActive : intelTabIdle}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <p className="text-sm text-text-muted">
          Click <strong className="text-slate-900">Review</strong> on a row to open the clip and take action.
        </p>
      </div>

      <PsIntelligenceCandidates queue={queue} channel={channel} />
    </div>
  );
}
