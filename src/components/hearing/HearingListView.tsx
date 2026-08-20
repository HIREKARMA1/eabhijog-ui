"use client";

import Link from "next/link";

import { Icon } from "@/components/icons/Icon";
import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { formatHearingWhen } from "@/lib/hearing/formatWhen";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import type { HearingPublicSummary } from "@/types/api";
import { SectionLoader, PageLoader } from "@/components/ui/Spinner";

function msUntil(iso: string) {
  return new Date(iso).getTime() - Date.now();
}

function formatCountdown(
  iso: string,
  prefix: string,
  t: ReturnType<typeof useI18n>["t"],
) {
  const ms = msUntil(iso);
  if (ms <= 0) return t("hearing", "list.countdownClosed", { prefix });

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days >= 2) return t("hearing", "list.countdownDays", { prefix, count: days });
  if (days === 1) return t("hearing", "list.countdownDay", { prefix });
  if (hours >= 2) return t("hearing", "list.countdownHours", { prefix, count: hours });
  if (hours === 1) return t("hearing", "list.countdownHour", { prefix });
  return t("hearing", "list.countdownSoon", { prefix });
}

type HearingListViewProps = {
  hearings: HearingPublicSummary[];
};

export function HearingListView({ hearings }: HearingListViewProps) {
  const { t } = useI18n();
  const H = (key: string, params?: Record<string, string | number>) => t("hearing", key, params);
  const openCount = hearings.filter((h) => h.registration_open).length;
  const howItWorks = [
    { step: "1", title: H("list.step1Title"), text: H("list.step1Text") },
    { step: "2", title: H("list.step2Title"), text: H("list.step2Text") },
    { step: "3", title: H("list.step3Title"), text: H("list.step3Text") },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      <section className="border-b-2 border-saffron/20 bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="font-medium text-navy-700 hover:text-saffron hover:underline">
              {t("common", "brand.name")}
            </Link>
            <Icon name="chevron-right" size={14} className="text-slate-400" />
            <span className="truncate text-slate-600">{H("list.breadcrumb")}</span>
          </nav>

          <div className="mt-6 lg:flex lg:items-end lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <p className="block text-xs font-bold uppercase tracking-wide text-saffron sm:tracking-[0.18em]">
                {H("list.kicker")}
              </p>
              <h1 className="mt-3 wrap-break-word text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem] lg:leading-tight">
                {H("list.title")}
              </h1>
              <p className="mt-3 max-w-4xl wrap-break-word text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                {H("list.lead")}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 lg:mt-0 lg:flex-col lg:items-end">
              <SummaryPill
                label={H("list.openForRegistration")}
                value={
                  openCount === 0
                    ? H("list.noneRightNow")
                    : openCount === 1
                      ? H("list.hearingCount", { count: openCount })
                      : H("list.hearingCountPlural", { count: openCount })
                }
                highlight={openCount > 0}
              />
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                  openCount > 0
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600",
                )}
              >
                {openCount > 0 ? H("list.registrationOpen") : H("list.noActiveSessions")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <div className="border-b border-border bg-surface-muted px-4 py-5 sm:px-8">
            <div className="mb-1 border-l-4 border-saffron pl-4">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{H("list.howItWorks")}</h2>
              <p className="mt-1 text-sm text-slate-600">{H("list.howItWorksLead")}</p>
            </div>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {howItWorks.map((item) => (
                <li
                  key={item.step}
                  className="rounded-lg border border-border bg-white p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-saffron bg-saffron text-xs font-bold text-white">
                    {item.step}
                  </span>
                  <p className="mt-3 text-sm font-bold text-navy-800">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
            <div className="mb-6 border-l-4 border-saffron pl-4">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {H("list.openHearings")}
                {hearings.length > 0 ? (
                  <span className="font-normal text-slate-500"> ({hearings.length})</span>
                ) : null}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{H("list.selectHearing")}</p>
            </div>

            {hearings.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-amber-900">{H("list.emptyTitle")}</p>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-amber-800">
                  {H("list.emptyBody")}
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex rounded-lg bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
                >
                  {H("list.backHome")}
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {hearings.map((hearing) => (
                  <HearingCard key={hearing.id} hearing={hearing} />
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border bg-surface-muted px-4 py-4 text-center sm:px-8">
            <p className="text-xs leading-relaxed text-slate-600">
              {H("list.footerBefore")}{" "}
              <Link href="/hearing/terms" className="font-semibold text-navy-700 hover:text-saffron hover:underline">
                {H("list.termsLink")}
              </Link>
              {H("list.footerAfter")}
            </p>
          </div>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}

function HearingCard({ hearing }: { hearing: HearingPublicSummary }) {
  const { t, locale } = useI18n();
  const H = (key: string, params?: Record<string, string | number>) => t("hearing", key, params);
  const closesSoon =
    hearing.registration_open && msUntil(hearing.registration_closes_at) <= 48 * 60 * 60 * 1000;
  const closesPrefix = H("list.closesLabel");

  return (
    <li className="rounded-lg border border-border bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <RegistrationBadge open={hearing.registration_open} status={hearing.status} />
            {closesSoon ? (
              <span className="text-xs font-semibold text-amber-700">
                {formatCountdown(hearing.registration_closes_at, closesPrefix, t)}
              </span>
            ) : null}
          </div>

          <h3 className="mt-1.5 wrap-break-word text-lg font-bold leading-snug text-slate-900">{hearing.title}</h3>

          {hearing.description ? (
            <p className="mt-1 wrap-break-word text-sm leading-relaxed text-slate-600">{hearing.description}</p>
          ) : null}

          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
            <span>
              <span className="font-medium text-slate-500">{H("list.hearingLabel")}:</span>{" "}
              {formatHearingWhen(hearing.hearing_date, locale)}
            </span>
            <span>
              <span className="font-medium text-slate-500">{H("list.closesLabel")}:</span>{" "}
              {formatHearingWhen(hearing.registration_closes_at, locale)}
              {hearing.registration_open ? (
                <span className="text-emerald-700">
                  {" "}
                  ({formatCountdown(hearing.registration_closes_at, closesPrefix, t)})
                </span>
              ) : null}
            </span>
            {hearing.hearing_end_at ? (
              <span>
                <span className="font-medium text-slate-500">{H("list.endsLabel")}:</span>{" "}
                {formatHearingWhen(hearing.hearing_end_at, locale)}
              </span>
            ) : null}
          </p>
        </div>

        {hearing.registration_open ? (
          <Link
            href={`/hearing/${hearing.id}/register`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-saffron px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-saffron/90 sm:min-w-44"
          >
            {H("list.registerCta")}
            <Icon name="chevron-right" size={16} className="ml-1.5" />
          </Link>
        ) : (
          <p className="shrink-0 text-sm text-slate-500">{H("list.registrationClosed")}</p>
        )}
      </div>
    </li>
  );
}

function RegistrationBadge({ open, status }: { open: boolean; status: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
        open
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {open ? t("hearing", "list.openBadge") : status.replaceAll("_", " ")}
    </span>
  );
}

function SummaryPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex min-w-0 w-full max-w-full flex-col rounded-lg border px-3 py-2 sm:w-auto sm:min-w-48",
        highlight ? "border-saffron/40 bg-saffron/5" : "border-border bg-white",
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="mt-0.5 wrap-break-word whitespace-normal text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function HearingListLoading() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      <section className="border-b-2 border-saffron/20 bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="font-medium text-navy-700 hover:text-saffron hover:underline">
              {t("common", "brand.name")}
            </Link>
            <Icon name="chevron-right" size={14} className="text-slate-400" />
            <span className="truncate text-slate-600">{t("hearing", "list.breadcrumb")}</span>
          </nav>
          <div className="mt-6 h-24 animate-pulse rounded-lg bg-surface-muted" aria-hidden />
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="overflow-hidden rounded-lg border border-border bg-white px-4 py-16 sm:px-8">
          <SectionLoader label={t("hearing", "loading.hearings")} />
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}

export function HearingRegisterLoading() {
  const { t } = useI18n();
  return <PageLoader label={t("hearing", "loading.register")} className="min-h-[50vh]" />;
}
