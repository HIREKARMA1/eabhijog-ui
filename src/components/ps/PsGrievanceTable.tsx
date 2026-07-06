import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { PsGrievanceRow } from "@/types/api";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatResolutionHours(hours: number | null | undefined): string {
  if (hours == null || hours <= 0) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours} hrs`;
}

function cell(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

export function PsGrievanceTable({ items }: { items: PsGrievanceRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-muted text-left text-xs uppercase text-text-muted">
          <tr>
            <th className="whitespace-nowrap px-3 py-2">Grievance ID</th>
            <th className="whitespace-nowrap px-3 py-2">WhatsApp Number</th>
            <th className="whitespace-nowrap px-3 py-2">Citizen Name</th>
            <th className="whitespace-nowrap px-3 py-2">Date &amp; Time Received</th>
            <th className="whitespace-nowrap px-3 py-2">Last Message Time</th>
            <th className="whitespace-nowrap px-3 py-2">Category</th>
            <th className="whitespace-nowrap px-3 py-2">District</th>
            <th className="whitespace-nowrap px-3 py-2">Constituency</th>
            <th className="whitespace-nowrap px-3 py-2">Assigned OSD</th>
            <th className="whitespace-nowrap px-3 py-2">Department</th>
            <th className="whitespace-nowrap px-3 py-2">Priority</th>
            <th className="whitespace-nowrap px-3 py-2">Current Status</th>
            <th className="whitespace-nowrap px-3 py-2">Response Received From</th>
            <th className="whitespace-nowrap px-3 py-2">Last Updated</th>
            <th className="whitespace-nowrap px-3 py-2">Total Conversation Count</th>
            <th className="whitespace-nowrap px-3 py-2">Resolution Time</th>
            <th className="whitespace-nowrap px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((g) => (
            <tr key={g.reference_number} className="border-t border-border hover:bg-surface-muted/30">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{g.reference_number}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">{g.citizen_phone}</td>
              <td className="whitespace-nowrap px-3 py-2">{cell(g.citizen_name)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">{formatDateTime(g.created_at)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">{formatDateTime(g.last_message_at)}</td>
              <td className="whitespace-nowrap px-3 py-2">{cell(g.category)}</td>
              <td className="whitespace-nowrap px-3 py-2">{cell(g.district)}</td>
              <td className="whitespace-nowrap px-3 py-2">{cell(g.constituency)}</td>
              <td className="whitespace-nowrap px-3 py-2">{cell(g.assigned_osd || g.osd_category)}</td>
              <td className="whitespace-nowrap px-3 py-2">{cell(g.department)}</td>
              <td className="whitespace-nowrap px-3 py-2 capitalize">{g.priority}</td>
              <td className="whitespace-nowrap px-3 py-2">
                <Badge>{g.status.replace(/_/g, " ")}</Badge>
              </td>
              <td className="whitespace-nowrap px-3 py-2">{cell(g.response_from)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">{formatDateTime(g.updated_at)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-center">{g.conversation_count}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">{formatResolutionHours(g.resolution_hours)}</td>
              <td className="whitespace-nowrap px-3 py-2">
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
