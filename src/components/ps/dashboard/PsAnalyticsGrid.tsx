"use client";

import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/context";
import type { PsWhatsAppAnalytics } from "@/types/api";

function formatHours(hours: number): string {
  if (!hours) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours}h`;
}

export function PsAnalyticsGrid({ analytics }: { analytics: PsWhatsAppAnalytics }) {
  const { t } = useI18n();

  const cards = [
    { key: "messagesToday", value: analytics.messages_received_today },
    { key: "uniqueCitizens", value: analytics.unique_citizens },
    { key: "repeatCitizens", value: analytics.repeat_citizens },
    { key: "activeConversations", value: analytics.active_conversations },
    { key: "avgFirstResponse", value: formatHours(analytics.avg_first_response_hours) },
    { key: "avgResolution", value: analytics.avg_resolution_hours },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <StatCard key={card.key} label={t("ps", `analytics.${card.key}`)} value={card.value} />
      ))}
    </div>
  );
}
