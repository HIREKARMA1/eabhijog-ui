"use client";

import { GrievanceListBackLink } from "@/components/grievance/GrievanceListBackLink";
import { ConversationView } from "@/components/grievance/ConversationView";
import { psAddNote, psWhatsAppReply } from "@/lib/api/portal";
import type { GrievanceConversationData } from "@/types/api";

export function PsConversationPanel({ data }: { data: GrievanceConversationData }) {
  return (
    <div className="space-y-4">
      <GrievanceListBackLink
        listHref="/ps/grievances"
        disposedListHref="/ps/disposed-grievances"
      />
      <ConversationView
        data={data}
        onAddNote={(text) => psAddNote(data.reference_number, text).then(() => undefined)}
        onWhatsAppReply={(message) =>
          psWhatsAppReply(data.reference_number, message).then(() => undefined)
        }
      />
    </div>
  );
}
