"use client";

import { psAddNote, psWhatsAppReply } from "@/lib/api/portal";
import { ConversationView } from "@/components/grievance/ConversationView";
import type { GrievanceConversationData } from "@/types/api";

export function PsConversationPanel({ data }: { data: GrievanceConversationData }) {
  return (
    <ConversationView
      data={data}
      onAddNote={(text) => psAddNote(data.reference_number, text).then(() => undefined)}
      onWhatsAppReply={(message) =>
        psWhatsAppReply(data.reference_number, message).then(() => undefined)
      }
    />
  );
}
