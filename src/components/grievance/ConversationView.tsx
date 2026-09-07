"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/context";
import { GrievanceAttachments } from "@/components/grievance/GrievanceAttachments";
import { GrievanceJourneyTimeline } from "@/components/grievance/GrievanceJourneyTimeline";
import { WhatsAppThread } from "@/components/grievance/WhatsAppThread";
import {
  cell,
  formatDateTime,
  formatDaysPending,
  formatResolutionHours,
  formatStatusLabel,
} from "@/lib/grievance/display";
import type { GrievanceConversationData } from "@/types/api";

type Props = {
  data: GrievanceConversationData;
  onAddNote: (text: string) => Promise<void>;
  onWhatsAppReply: (message: string) => Promise<void>;
  actionsPanel?: ReactNode;
};

export function ConversationView({ data, onAddNote, onWhatsAppReply, actionsPanel }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);

  const submitNote = useCallback(async () => {
    if (!noteText.trim()) return;
    setBusy(true);
    try {
      await onAddNote(noteText.trim());
      setNoteText("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [noteText, onAddNote, router]);

  const g = data.grievance;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <WhatsAppThread data={data} onWhatsAppReply={onWhatsAppReply} />

        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h2 className="font-medium">{g.reference_number}</h2>
            <p className="text-sm text-text-muted">{g.title}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.citizenName")}</dt>
                <dd>{cell(g.citizen_name)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.whatsappNumber")}</dt>
                <dd>{g.citizen_phone}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.category")}</dt>
                <dd>{g.category}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.assignedOsd")}</dt>
                <dd>{cell(g.assigned_osd || g.osd_category)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.district")}</dt>
                <dd>{cell(g.district)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.constituency")}</dt>
                <dd>{cell(g.constituency)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.department")}</dt>
                <dd>{cell(g.department)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.priority")}</dt>
                <dd className="capitalize">{g.priority}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.status")}</dt>
                <dd>{formatStatusLabel(g.status)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.daysPending")}</dt>
                <dd>{formatDaysPending(g.created_at, g.status)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.received")}</dt>
                <dd>{formatDateTime(g.created_at)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.lastMessageAt")}</dt>
                <dd>{formatDateTime(g.last_message_at)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.lastUpdated")}</dt>
                <dd>{formatDateTime(g.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.responseFrom")}</dt>
                <dd>{cell(g.response_from)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.conversationCount")}</dt>
                <dd>{g.conversation_count}</dd>
              </div>
              <div>
                <dt className="text-text-muted">{t("dashboard", "grievance.resolutionTime")}</dt>
                <dd>{formatResolutionHours(g.resolution_hours)}</dd>
              </div>
            </dl>
          </div>

          {data.attachments?.length ? (
            <div className="rounded-lg border border-border p-4">
              <GrievanceAttachments attachments={data.attachments} />
            </div>
          ) : null}

          <div className="rounded-lg border border-border p-4">
            <h3 className="text-sm font-medium">Internal Notes</h3>
            <ul className="mt-2 max-h-32 space-y-2 overflow-y-auto text-sm">
              {data.internal_notes.map((n) => (
                <li key={n.id} className="rounded bg-surface-muted p-2">
                  <p className="text-xs text-text-muted">
                    {n.author_name} · {new Date(n.created_at).toLocaleString()}
                  </p>
                  <p>{n.note_text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Add internal note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <Button disabled={busy || !noteText.trim()} onClick={submitNote}>
                Add
              </Button>
            </div>
          </div>

          {actionsPanel}
        </div>
      </div>

      <GrievanceJourneyTimeline events={data.journey ?? []} />
    </div>
  );
}
