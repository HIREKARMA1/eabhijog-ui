"use client";

import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/context";
import type { PsSummaryCards } from "@/types/api";

export function PsSummaryGrid({ summary }: { summary: PsSummaryCards }) {
  const { t } = useI18n();

  const cards = [
    { key: "whatsappMessages", value: summary.total_whatsapp_messages },
    { key: "validGrievances", value: summary.total_valid_grievances },
    { key: "todaysGrievances", value: summary.todays_grievances },
    { key: "pendingAck", value: summary.pending_acknowledgement },
    { key: "assigned", value: summary.assigned },
    { key: "inProgress", value: summary.in_progress },
    { key: "waitingDept", value: summary.waiting_for_department },
    { key: "deptResponded", value: summary.department_responded },
    { key: "citizenUpdated", value: summary.citizen_updated },
    { key: "resolved", value: summary.resolved },
    { key: "closed", value: summary.closed },
    { key: "discarded", value: summary.discarded },
    { key: "escalated", value: summary.escalated },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          label={t("ps", `summary.${card.key}`)}
          value={card.value}
        />
      ))}
    </div>
  );
}
