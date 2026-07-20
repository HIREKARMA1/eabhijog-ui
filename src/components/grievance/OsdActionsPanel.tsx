"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  osdEscalateToPs,
  osdMarkResolved,
  osdReassignGrievance,
  osdRequestMoreInfo,
  osdUploadAttachments,
  updateOsdStatus,
} from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import type { GrievanceConversationData } from "@/types/api";

type Props = {
  data: GrievanceConversationData;
  osdSlug: string;
};

export function OsdActionsPanel({ data, osdSlug }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [showSummary, setShowSummary] = useState(false);
  const [infoRequestText, setInfoRequestText] = useState("");
  const [priority, setPriority] = useState(data.grievance.priority);
  const [reassignCategory, setReassignCategory] = useState(data.grievance.osd_category);

  const actions = data.actions;
  const ref = data.reference_number;

  const run = useCallback(
    async (fn: () => Promise<unknown>, successMsg: string) => {
      setFeedback(null);
      setBusy(true);
      try {
        await fn();
        setFeedback({ type: "success", text: successMsg });
        router.refresh();
      } catch (err) {
        setFeedback({
          type: "error",
          text: err instanceof ApiError ? err.message : "Action failed.",
        });
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium">OSD Actions</h3>

      <div className="mt-3 space-y-3">
        <div>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start"
            disabled={busy}
            onClick={() => setShowSummary((v) => !v)}
          >
            {showSummary ? "Hide AI Summary" : "Read AI-Generated Summary"}
          </Button>
          {showSummary ? (
            <div className="mt-2 rounded bg-surface-muted p-3 text-sm">
              {data.ai_summary ? (
                <p className="whitespace-pre-wrap">{data.ai_summary}</p>
              ) : (
                <p className="text-text-muted">No AI summary available for this grievance.</p>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium uppercase text-text-muted">Request more information</p>
          <Textarea
            rows={2}
            placeholder="Optional custom message (default template used if empty)..."
            value={infoRequestText}
            onChange={(e) => setInfoRequestText(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            loading={busy}
            onClick={() =>
              run(
                () => osdRequestMoreInfo(osdSlug, ref, infoRequestText.trim()),
                "Information request sent to citizen.",
              )
            }
          >
            Request More Information
          </Button>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium uppercase text-text-muted">Upload supporting documents</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,video/mp4,video/3gpp"
            className="block w-full text-sm"
            onChange={(e) => {
              const files = e.target.files;
              if (!files?.length) return;
              void run(
                () => osdUploadAttachments(osdSlug, ref, files),
                `${files.length} document(s) uploaded.`,
              ).finally(() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
              });
            }}
          />
          <p className="text-xs text-text-muted">Photos, PDFs, or short videos (max 5 files).</p>
        </div>

        {actions?.can_mark_resolved ? (
          <Button
            type="button"
            className="w-full"
            loading={busy}
            onClick={() =>
              run(() => osdMarkResolved(osdSlug, ref), "Grievance marked resolved.")
            }
          >
            Mark Resolved
          </Button>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          loading={busy}
          onClick={() =>
            run(() => osdEscalateToPs(osdSlug, ref), "Escalated to Private Secretary.")
          }
        >
          Escalate to PS
        </Button>

        {actions?.can_reassign ? (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase text-text-muted">Reassign (authorized)</p>
            <Select
              value={reassignCategory}
              onChange={(e) => setReassignCategory(e.target.value)}
              options={(actions.osd_categories ?? []).map((c) => ({ value: c, label: c }))}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              loading={busy}
              disabled={reassignCategory === data.grievance.osd_category}
              onClick={() =>
                run(
                  () => osdReassignGrievance(osdSlug, ref, reassignCategory),
                  `Reassigned to ${reassignCategory}.`,
                )
              }
            >
              Reassign Grievance
            </Button>
          </div>
        ) : null}

        {actions?.priorities?.length ? (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase text-text-muted">Change priority</p>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={actions.priorities.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
              }))}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              loading={busy}
              disabled={priority === data.grievance.priority}
              onClick={() =>
                run(
                  () =>
                    updateOsdStatus(osdSlug, ref, {
                      status: data.grievance.status,
                      priority,
                      remarks: "Priority updated from conversation view.",
                    }),
                  "Priority updated.",
                )
              }
            >
              Update Priority
            </Button>
          </div>
        ) : null}
      </div>

      {feedback ? (
        <p
          className={`mt-3 text-sm ${feedback.type === "error" ? "text-danger" : "text-success"}`}
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
