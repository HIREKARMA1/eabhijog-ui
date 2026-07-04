import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { PsGrievanceRow } from "@/types/api";

export function PsGrievanceTable({ items }: { items: PsGrievanceRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-muted text-left text-xs uppercase text-text-muted">
          <tr>
            <th className="px-3 py-2">Grievance ID</th>
            <th className="px-3 py-2">WhatsApp</th>
            <th className="px-3 py-2">Citizen</th>
            <th className="px-3 py-2">Received</th>
            <th className="px-3 py-2">Last Message</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">District</th>
            <th className="px-3 py-2">OSD</th>
            <th className="px-3 py-2">Priority</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Msgs</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((g) => (
            <tr key={g.reference_number} className="border-t border-border hover:bg-surface-muted/30">
              <td className="px-3 py-2 font-mono text-xs">{g.reference_number}</td>
              <td className="px-3 py-2 text-xs">{g.citizen_phone}</td>
              <td className="px-3 py-2">{g.citizen_name}</td>
              <td className="px-3 py-2 text-xs">{new Date(g.created_at).toLocaleString()}</td>
              <td className="px-3 py-2 text-xs">
                {g.last_message_at ? new Date(g.last_message_at).toLocaleString() : "—"}
              </td>
              <td className="px-3 py-2">{g.category}</td>
              <td className="px-3 py-2">{g.district}</td>
              <td className="px-3 py-2">{g.osd_category}</td>
              <td className="px-3 py-2">{g.priority}</td>
              <td className="px-3 py-2">
                <Badge>{g.status.replace(/_/g, " ")}</Badge>
              </td>
              <td className="px-3 py-2 text-center">{g.conversation_count}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/ps/grievance/${g.reference_number}`}
                  className="text-brand hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
