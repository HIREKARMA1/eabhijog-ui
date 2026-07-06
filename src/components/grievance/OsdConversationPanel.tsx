"use client";

import { OsdActionsPanel } from "@/components/grievance/OsdActionsPanel";
import { osdAddNote, osdWhatsAppReply } from "@/lib/api/portal";
import { ConversationView } from "@/components/grievance/ConversationView";
import type { GrievanceConversationData } from "@/types/api";

export function OsdConversationPanel({
  data,
  osdSlug,
}: {
  data: GrievanceConversationData;
  osdSlug: string;
}) {
  return (
    <ConversationView
      data={data}
      onAddNote={(text) => osdAddNote(osdSlug, data.reference_number, text).then(() => undefined)}
      onWhatsAppReply={(message) =>
        osdWhatsAppReply(osdSlug, data.reference_number, message).then(() => undefined)
      }
      actionsPanel={<OsdActionsPanel data={data} osdSlug={osdSlug} />}
    />
  );
}
