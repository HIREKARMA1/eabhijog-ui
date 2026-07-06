"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { PsDashboardData } from "@/types/api";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function formatHours(hours: number): string {
  if (!hours) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours}h`;
}

export function PsDashboardOverview({ data }: { data: PsDashboardData }) {
  const { summary, analytics, recent_grievances } = data;

  const summaryCards = [
    { label: "WhatsApp Messages", value: summary.total_whatsapp_messages },
    { label: "Valid Grievances", value: summary.total_valid_grievances },
    { label: "Today's Grievances", value: summary.todays_grievances },
    { label: "Pending Acknowledgement", value: summary.pending_acknowledgement },
    { label: "Assigned", value: summary.assigned },
    { label: "In Progress", value: summary.in_progress },
    { label: "Waiting for Department", value: summary.waiting_for_department },
    { label: "Department Responded", value: summary.department_responded },
    { label: "Citizen Updated", value: summary.citizen_updated },
    { label: "Resolved", value: summary.resolved },
    { label: "Closed", value: summary.closed },
    { label: "Discarded", value: summary.discarded },
    { label: "Escalated", value: summary.escalated },
  ];

  const analyticsCards: Array<{ label: string; value: number | string }> = [
    { label: "Messages Today", value: analytics.messages_received_today },
    { label: "Unique Citizens", value: analytics.unique_citizens },
    { label: "Repeat Citizens", value: analytics.repeat_citizens },
    { label: "Active Conversations (7d)", value: analytics.active_conversations },
    {
      label: "Avg First Response Time",
      value: formatHours(analytics.avg_first_response_hours),
    },
    { label: "Avg Resolution (hrs)", value: analytics.avg_resolution_hours },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Private Secretary Dashboard</h1>
        <p className="text-sm text-text-muted">Real-time overview of grievances and WhatsApp activity</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-muted">Summary</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {summaryCards.map((c) => (
            <StatCard key={c.label} label={c.label} value={c.value} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-muted">
          WhatsApp Analytics
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {analyticsCards.map((c) => (
            <StatCard key={c.label} label={c.label} value={c.value} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-muted">
            Recent Grievances
          </h2>
          <Link href="/ps/grievances" className="text-sm text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase text-text-muted">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Citizen</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">District</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {recent_grievances.map((g) => (
                <tr key={g.reference_number} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{g.reference_number}</td>
                  <td className="px-3 py-2">{g.citizen_name}</td>
                  <td className="px-3 py-2">{g.category}</td>
                  <td className="px-3 py-2">{g.district}</td>
                  <td className="px-3 py-2">
                    <Badge>{g.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-3 py-2">{g.priority}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/ps/grievance/${g.reference_number}`}
                      className="text-brand hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
