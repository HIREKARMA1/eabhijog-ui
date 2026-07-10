"use client";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/context";
import type { JourneyEvent } from "@/types/api";

type Props = {
  events: JourneyEvent[];
  className?: string;
};

function localeTag(locale: string): string {
  if (locale === "or") return "or-IN";
  if (locale === "hi") return "hi-IN";
  return "en-IN";
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(localeTag(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string, locale: string): string {
  return new Date(value).toLocaleTimeString(localeTag(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function GrievanceJourneyTimeline({ events, className }: Props) {
  const { t, locale } = useI18n();

  return (
    <Card title={t("dashboard", "journey.title")} className={className}>
      {events.length === 0 ? (
        <p className="text-sm text-text-muted">{t("dashboard", "journey.empty")}</p>
      ) : (
        <ol className="space-y-0">
          {events.map((event, index) => (
            <li key={event.id} className="relative pb-8 pl-8 last:pb-0">
              {index < events.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[11px] top-7 h-[calc(100%-0.75rem)] w-0.5 bg-brand/25"
                />
              ) : null}
              <span
                aria-hidden
                className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand bg-white text-[10px] font-bold text-brand"
              >
                {index + 1}
              </span>

              <div className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
                <p className="text-base font-semibold text-slate-900">{event.action}</p>
                <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t("dashboard", "journey.date")}
                    </dt>
                    <dd className="mt-0.5 font-medium text-slate-900">
                      {formatDate(event.occurred_at, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t("dashboard", "journey.time")}
                    </dt>
                    <dd className="mt-0.5 font-medium text-slate-900">
                      {formatTime(event.occurred_at, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t("dashboard", "journey.user")}
                    </dt>
                    <dd className="mt-0.5 font-medium text-slate-900">{event.user}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t("dashboard", "journey.action")}
                    </dt>
                    <dd className="mt-0.5 font-medium text-slate-900">{event.action}</dd>
                  </div>
                </dl>
                {event.remarks ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t("dashboard", "journey.remarks")}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{event.remarks}</p>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
