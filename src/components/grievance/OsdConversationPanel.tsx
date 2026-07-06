"use client";

import { useRouter } from "next/navigation";

import { osdAddNote, osdEscalateToPs, osdWhatsAppReply } from "@/lib/api/portal";
import { ConversationView } from "@/components/grievance/ConversationView";
import type { GrievanceConversationData } from "@/types/api";

export function OsdConversationPanel({
  data,
  osdSlug,
}: {
  data: GrievanceConversationData;
  osdSlug: string;
}) {
  const router = useRouter();

  return (
    <ConversationView
      data={data}
      onAddNote={(text) => osdAddNote(osdSlug, data.reference_number, text).then(() => undefined)}
      onWhatsAppReply={(message) =>
        osdWhatsAppReply(osdSlug, data.reference_number, message).then(() => undefined)
      }
      onEscalate={() =>
        osdEscalateToPs(osdSlug, data.reference_number).then(() => {
          router.refresh();
        })
      }
    />
  );
}
