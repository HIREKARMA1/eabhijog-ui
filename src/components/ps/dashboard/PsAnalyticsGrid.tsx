"use client";

import { Card } from "@/components/ui/Card";
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
  const heroValue = analytics.messages_received_today ?? 0;

  const cards = [
    { key: "uniqueCitizens", value: analytics.unique_citizens },
    { key: "repeatCitizens", value: analytics.repeat_citizens },
    { key: "activeConversations", value: analytics.active_conversations },
    { key: "avgFirstResponse", value: formatHours(analytics.avg_first_response_hours) },
    { key: "avgResolution", value: analytics.avg_resolution_hours },
  ] as const;

  return (
    <div className="space-y-4">
      <Card className="flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-500 text-white shadow-xl shadow-cyan-900/20">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            {t("ps", "analytics.messagesToday")}
          </p>
          <p className="mt-5 text-5xl font-semibold leading-none tabular-nums">{heroValue}</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/85">
            Across {analytics.unique_citizens ?? 0} unique citizens and {analytics.active_conversations ?? 0} active
            conversations this week.
          </p>
        </div>
        <div className="mt-8 flex items-end gap-1.5 opacity-85">
          {[12, 24, 18, 34, 14, 28, 38, 24, 42, 50, 58, 62].map((height, index) => (
            <span
              key={index}
              className="w-2 rounded-t-full bg-white/75"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, index) => (
          <StatCard
            key={card.key}
            label={t("ps", `analytics.${card.key}`)}
            value={card.value}
            tone={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
