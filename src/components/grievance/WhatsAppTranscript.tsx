"use client";

import { useI18n } from "@/lib/i18n/context";
import type { WhatsAppMessageItem } from "@/types/api";

type WhatsAppTranscriptProps = {
  messages: WhatsAppMessageItem[];
};

export function WhatsAppTranscript({ messages }: WhatsAppTranscriptProps) {
  const { t } = useI18n();

  return (
    <div className="flex max-h-[480px] flex-col gap-2 overflow-y-auto p-1">
      {messages.length === 0 ? (
        <p className="text-sm text-text-muted">{t("dashboard", "grievance.conversationEmpty")}</p>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.direction === "inbound" ? "self-start bg-surface-muted" : "self-end bg-brand/10"
            }`}
          >
            <p className="text-xs text-text-muted">
              {m.sender_name ||
                (m.direction === "inbound"
                  ? t("dashboard", "grievance.citizen")
                  : m.trigger === "bot"
                    ? t("common", "brand.bot")
                    : "Office")}{" "}
              · {new Date(m.created_at).toLocaleString()}
            </p>
            {m.body ? <p className="mt-1 whitespace-pre-wrap">{m.body}</p> : null}
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
  );
}
