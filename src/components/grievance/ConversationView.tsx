"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/context";
import { Textarea } from "@/components/ui/Textarea";
import { GrievanceAttachments } from "@/components/grievance/GrievanceAttachments";
import { GrievanceJourneyTimeline } from "@/components/grievance/GrievanceJourneyTimeline";
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
  actionsPanel?: React.ReactNode;
};

export function ConversationView({ data, onAddNote, onWhatsAppReply, actionsPanel }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [noteText, setNoteText] = useState("");
  const [replyText, setReplyText] = useState("");
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

  const submitReply = useCallback(async () => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await onWhatsAppReply(replyText.trim());
      setReplyText("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [replyText, onWhatsAppReply, router]);

  const g = data.grievance;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-border">
          <div className="border-b border-border bg-surface-muted px-4 py-3">
            <h2 className="font-medium">WhatsApp Conversation</h2>
            <p className="text-xs text-text-muted">{g.citizen_phone}</p>
          </div>
          <div className="flex max-h-[520px] flex-1 flex-col gap-2 overflow-y-auto p-4">
            {data.messages.length === 0 ? (
              <p className="text-sm text-text-muted">No messages recorded yet.</p>
            ) : (
              data.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.direction === "inbound"
                      ? "self-start bg-surface-muted"
                      : "self-end bg-brand/10"
                    }`}
                >
                  <p className="text-xs text-text-muted">
                    {m.sender_name ||
                      (m.direction === "inbound"
                        ? "Citizen"
                        : m.trigger === "bot"
                          ? t("common", "brand.bot")
                          : "Office")}{" "}
                    · {new Date(m.created_at).toLocaleString()}
                  </p>
                  {m.body && <p className="mt-1 whitespace-pre-wrap">{m.body}</p>}
                  {m.media_urls?.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-xs text-brand underline"
                    >
                      Attachment
                    </a>
                  ))}
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border p-3">
            <Textarea
              rows={2}
              placeholder="Send WhatsApp reply to citizen..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button className="mt-2" disabled={busy || !replyText.trim()} onClick={submitReply}>
              Send WhatsApp Reply
            </Button>
          </div>
        </div>

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
