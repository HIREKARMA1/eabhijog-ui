"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import type { GrievanceConversationData } from "@/types/api";

type Props = {
  data: GrievanceConversationData;
  onWhatsAppReply: (message: string) => Promise<void>;
  compact?: boolean;
  /** Fill the parent height instead of using a fixed max-height. */
  fillHeight?: boolean;
};

export function WhatsAppThread({
  data,
  onWhatsAppReply,
  compact = false,
  fillHeight = false,
}: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  const g = data.grievance;

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

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-white",
        fillHeight && "h-full min-h-0 w-full",
      )}
    >
      <div className="shrink-0 border-b border-border bg-surface-muted px-4 py-3">
        <h2 className="font-medium">WhatsApp Conversation</h2>
        <p className="text-xs text-text-muted">{g.citizen_phone}</p>
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4",
          !fillHeight && (compact ? "max-h-[320px]" : "max-h-[520px]"),
        )}
      >
        {data.messages.length === 0 ? (
          <p className="text-sm text-text-muted">No messages recorded yet.</p>
        ) : (
          data.messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.direction === "inbound" ? "self-start bg-surface-muted" : "self-end bg-brand/10"
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
      <div className="shrink-0 border-t border-border p-3">
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
  );
}
