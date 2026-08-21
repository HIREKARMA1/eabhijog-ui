"use client";

import Link from "next/link";

import { Icon } from "@/components/icons/Icon";
import { HearingBannerCarousel } from "@/components/hearing/HearingBannerCarousel";
import { HearingRichTextContent } from "@/components/hearing/HearingRichTextContent";
import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { cn } from "@/lib/utils/cn";
import {
  hearingImportantNotes,
  hearingWhatToExpect,
} from "@/lib/hearing/eventDefaults";
import { resolveHearingContent } from "@/lib/hearing/resolveContent";
import { isEmptyHearingHtml, toEditorHtml } from "@/lib/hearing/richText";
import { useI18n } from "@/lib/i18n/context";
import type { HearingPublicSummary } from "@/types/api";

const DEFAULT_BANNER = "/images/hearing-event-banner.svg";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatDay(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function msUntil(iso: string) {
  return new Date(iso).getTime() - Date.now();
}

function formatCountdown(iso: string, prefix: string) {
  const ms = msUntil(iso);
  if (ms <= 0) return `${prefix} closed`;

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days >= 2) return `${prefix} in ${days} days`;
  if (days === 1) return `${prefix} in 1 day`;
  if (hours >= 2) return `${prefix} in ${hours} hours`;
  if (hours === 1) return `${prefix} in 1 hour`;
  return `${prefix} soon`;
}

type Props = {
  hearing: HearingPublicSummary;
};

export function HearingPublicDetailView({ hearing }: Props) {
  const { locale, t } = useI18n();
  const H = (key: string) => t("hearing", key);
  const content = resolveHearingContent(hearing, locale);
  const closesSoon =
    hearing.registration_open && msUntil(hearing.registration_closes_at) <= 48 * 60 * 60 * 1000;
  const bannerImages =
    hearing.banner_image_urls?.filter((url) => url.trim()).length
      ? hearing.banner_image_urls.filter((url) => url.trim())
      : hearing.banner_image_url?.trim()
        ? [hearing.banner_image_url.trim()]
        : [DEFAULT_BANNER];
  const venue = hearing.venue?.trim() || "Online (Google Meet)";
  const hostedBy = hearing.hosted_by?.trim() || "";
  const descriptionHtml = toEditorHtml(content.description || "");
  const expectHtml = toEditorHtml(hearingWhatToExpect(content.what_to_expect));
  const notesHtml = toEditorHtml(hearingImportantNotes(content.important_notes));
  const hasDescription = !isEmptyHearingHtml(content.description);
  const hasExpect = !isEmptyHearingHtml(expectHtml);
  const hasNotes = !isEmptyHearingHtml(notesHtml);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      <section className="relative overflow-hidden bg-navy-900">
        <div className="relative sm:min-h-[20rem] lg:min-h-[24rem]">
          <div className="overflow-hidden sm:absolute sm:inset-0">
            <HearingBannerCarousel images={bannerImages} className="w-full" />
          </div>
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-navy-900/90 via-navy-900/45 to-navy-900/20 sm:block" />
          <div className="relative mx-auto flex w-full max-w-[1920px] flex-col justify-end bg-navy-900 px-4 pb-8 pt-6 sm:absolute sm:inset-0 sm:min-h-[20rem] sm:bg-transparent sm:px-6 sm:pb-8 sm:pt-10 lg:min-h-[24rem] lg:px-10 lg:pb-10">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <RegistrationBadge
                  open={hearing.registration_open}
                  status={hearing.status}
                  openLabel={H("list.openBadge")}
                />
                {closesSoon ? (
                  <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-100">
                    {formatCountdown(hearing.registration_closes_at, H("detail.closesPrefix"))}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                {content.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90 sm:text-base lg:text-[1.0625rem]">
                <span>
                  <span className="text-white/60">{H("detail.date")}:</span> {formatDay(hearing.hearing_date)}
                </span>
                <span>
                  <span className="text-white/60">{H("detail.time")}:</span> {formatTime(hearing.hearing_date)}
                  {hearing.hearing_end_at ? ` - ${formatTime(hearing.hearing_end_at)}` : ""}
                </span>
                <span>
                  <span className="text-white/60">{H("detail.venue")}:</span> {venue}
                </span>
                {hostedBy ? (
                  <span>
                    <span className="text-white/60">{H("detail.hostedBy")}:</span> {hostedBy}
                  </span>
                ) : null}
              </div>
              {hearing.registration_open ? (
                <Link
                  href={`/hearing/${hearing.id}/register`}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-saffron px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-saffron/90"
                >
                  {H("detail.registerCta")}
                  <Icon name="chevron-right" size={16} className="ml-1.5" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <main
        className={cn(
          "mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8",
          hearing.registration_open && "pb-24 lg:pb-8",
        )}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="border-b border-border bg-surface-muted px-4 py-4 sm:px-6">
                <div className="border-l-4 border-saffron pl-4">
                  <h2 className="text-lg font-bold text-slate-900">{H("detail.aboutTitle")}</h2>
                  <p className="mt-1 text-sm text-slate-600">{H("detail.aboutLead")}</p>
                </div>
              </div>
              <div className="px-4 py-5 sm:px-6">
                {hasDescription ? (
                  <HearingRichTextContent
                    html={descriptionHtml}
                    className="sm:text-[0.9375rem]"
                  />
                ) : (
                  <p className="text-sm text-slate-500">{H("detail.noDescription")}</p>
                )}

                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  <MetaCard label={H("detail.venue")} value={venue} />
                  {hostedBy ? <MetaCard label={H("detail.hostedBy")} value={hostedBy} /> : null}
                  <MetaCard
                    label={H("detail.status")}
                    value={
                      hearing.registration_open
                        ? H("detail.registrationOpen")
                        : hearing.status.replaceAll("_", " ")
                    }
                  />
                </dl>
              </div>
            </section>

            {hasExpect ? (
              <section className="overflow-hidden rounded-xl border border-border bg-white">
                <div className="border-b border-border bg-surface-muted px-4 py-4 sm:px-6">
                  <div className="border-l-4 border-saffron pl-4">
                    <h2 className="text-lg font-bold text-slate-900">{H("detail.expectTitle")}</h2>
                    <p className="mt-1 text-sm text-slate-600">{H("detail.expectLead")}</p>
                  </div>
                </div>
                <div className="px-4 py-5 sm:px-6">
                  <HearingRichTextContent html={expectHtml} />
                </div>
              </section>
            ) : null}

            {hasNotes ? (
              <section className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
                <div className="px-4 py-4 sm:px-6">
                  <h2 className="text-base font-bold text-amber-950">{H("detail.notesTitle")}</h2>
                  <div className="mt-3">
                    <HearingRichTextContent
                      html={notesHtml}
                      className="text-amber-900 [&_a]:text-amber-950"
                    />
                  </div>
                </div>
              </section>
            ) : null}

            <section className="rounded-xl border border-border bg-white px-4 py-4 text-center sm:px-6">
              <p className="text-xs leading-relaxed text-slate-600">
                {H("detail.termsBefore")}{" "}
                <Link
                  href="/hearing/terms"
                  className="font-semibold text-navy-700 hover:text-saffron hover:underline"
                >
                  {H("detail.termsLink")}
                </Link>
                {H("detail.termsAfter")}
              </p>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4">
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="border-b border-border bg-navy-700 px-4 py-3 text-white">
                <p className="text-sm font-semibold">{H("detail.scheduleTitle")}</p>
                <p className="mt-0.5 text-xs text-white/75">{H("detail.scheduleLead")}</p>
              </div>
              <div className="space-y-3 px-4 py-4">
                <ScheduleRow label={H("detail.hearing")} value={formatWhen(hearing.hearing_date)} />
                <ScheduleRow
                  label={H("detail.registrationCloses")}
                  value={formatWhen(hearing.registration_closes_at)}
                  hint={
                    hearing.registration_open
                      ? formatCountdown(hearing.registration_closes_at, H("detail.closesPrefix"))
                      : undefined
                  }
                />
                {hearing.hearing_end_at ? (
                  <ScheduleRow label={H("detail.ends")} value={formatWhen(hearing.hearing_end_at)} />
                ) : null}
              </div>
              <div className="hidden border-t border-border px-4 py-4 lg:block">
                <p className="text-sm text-slate-600">
                  {hearing.registration_open ? H("detail.openBody") : H("detail.closedBody")}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {hearing.registration_open ? (
                    <Link
                      href={`/hearing/${hearing.id}/register`}
                      className="inline-flex items-center justify-center rounded-lg bg-saffron px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-saffron/90"
                    >
                      {H("detail.registerCta")}
                      <Icon name="chevron-right" size={16} className="ml-1.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {hearing.registration_open ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
          <Link
            href={`/hearing/${hearing.id}/register`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-saffron px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-saffron/90"
          >
            {H("detail.registerCta")}
            <Icon name="chevron-right" size={16} className="ml-1.5" />
          </Link>
        </div>
      ) : null}

      <PortalFooter />
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-3 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold capitalize text-slate-900">{value}</dd>
    </div>
  );
}

function ScheduleRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs font-medium text-emerald-700">{hint}</p> : null}
    </div>
  );
}

function RegistrationBadge({
  open,
  status,
  openLabel,
}: {
  open: boolean;
  status: string;
  openLabel: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
        open
          ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-50"
          : "border-white/20 bg-white/10 text-white/85",
      )}
    >
      {open ? openLabel : status.replaceAll("_", " ")}
    </span>
  );
}
