import Link from "next/link";

import { Icon } from "@/components/icons/Icon";
import { HearingRichTextContent } from "@/components/hearing/HearingRichTextContent";
import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { cn } from "@/lib/utils/cn";
import {
  hearingImportantNotes,
  hearingWhatToExpect,
} from "@/lib/hearing/eventDefaults";
import { isEmptyHearingHtml, toEditorHtml } from "@/lib/hearing/richText";
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
  const closesSoon =
    hearing.registration_open && msUntil(hearing.registration_closes_at) <= 48 * 60 * 60 * 1000;
  const bannerSrc = hearing.banner_image_url?.trim() || DEFAULT_BANNER;
  const venue = hearing.venue?.trim() || "Online (Google Meet)";
  const hostedBy = hearing.hosted_by?.trim() || "";
  const descriptionHtml = toEditorHtml(hearing.description || "");
  const expectHtml = toEditorHtml(hearingWhatToExpect(hearing.what_to_expect));
  const notesHtml = toEditorHtml(hearingImportantNotes(hearing.important_notes));
  const hasDescription = !isEmptyHearingHtml(hearing.description);
  const hasExpect = !isEmptyHearingHtml(expectHtml);
  const hasNotes = !isEmptyHearingHtml(notesHtml);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      <section className="relative overflow-hidden">
          <div className="relative min-h-[16rem] sm:min-h-[20rem] lg:min-h-[24rem]">
          {/* Default SVG or admin-provided remote URL */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/45 to-navy-900/20" />
          <div className="relative mx-auto flex h-full min-h-[16rem] w-full max-w-[1920px] flex-col justify-end px-4 pb-8 pt-10 sm:min-h-[20rem] sm:px-6 lg:min-h-[24rem] lg:px-10 lg:pb-10">
            <nav className="mb-auto flex flex-wrap items-center gap-2 text-sm text-white/80">
              <Link href="/" className="font-medium text-white hover:text-saffron hover:underline">
                Jana Samadhan
              </Link>
              <Icon name="chevron-right" size={14} className="text-white/50" />
              <Link href="/hearing" className="font-medium text-white hover:text-saffron hover:underline">
                Online Grievance Hearing
              </Link>
              <Icon name="chevron-right" size={14} className="text-white/50" />
              <span className="truncate text-white/70">{hearing.title}</span>
            </nav>

            <div className="mt-10 max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                Online Grievance Hearing
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <RegistrationBadge open={hearing.registration_open} status={hearing.status} />
                {closesSoon ? (
                  <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-100">
                    {formatCountdown(hearing.registration_closes_at, "Closes")}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                {hearing.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
                <span>
                  <span className="text-white/60">Date:</span> {formatDay(hearing.hearing_date)}
                </span>
                <span>
                  <span className="text-white/60">Time:</span> {formatTime(hearing.hearing_date)}
                  {hearing.hearing_end_at ? ` - ${formatTime(hearing.hearing_end_at)}` : ""}
                </span>
                <span>
                  <span className="text-white/60">Venue:</span> {venue}
                </span>
                {hostedBy ? (
                  <span>
                    <span className="text-white/60">Hosted by:</span> {hostedBy}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="border-b border-border bg-surface-muted px-4 py-4 sm:px-6">
                <div className="border-l-4 border-saffron pl-4">
                  <h2 className="text-lg font-bold text-slate-900">About this hearing</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Session overview and purpose for citizens registering grievances.
                  </p>
                </div>
              </div>
              <div className="px-4 py-5 sm:px-6">
                {hasDescription ? (
                  <HearingRichTextContent
                    html={descriptionHtml}
                    className="sm:text-[0.9375rem]"
                  />
                ) : (
                  <p className="text-sm text-slate-500">
                    No additional description has been published for this hearing yet.
                  </p>
                )}

                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  <MetaCard label="Mode" value="Virtual hearing" />
                  <MetaCard label="Venue" value={venue} />
                  {hostedBy ? <MetaCard label="Hosted by" value={hostedBy} /> : null}
                  <MetaCard label="Status" value={hearing.registration_open ? "Registration open" : hearing.status.replaceAll("_", " ")} />
                </dl>
              </div>
            </section>

            {hasExpect ? (
              <section className="overflow-hidden rounded-xl border border-border bg-white">
                <div className="border-b border-border bg-surface-muted px-4 py-4 sm:px-6">
                  <div className="border-l-4 border-saffron pl-4">
                    <h2 className="text-lg font-bold text-slate-900">What to expect</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      How the Online Grievance Hearing typically runs.
                    </p>
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
                  <h2 className="text-base font-bold text-amber-950">Important notes</h2>
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
                By registering, you agree to the{" "}
                <Link
                  href="/hearing/terms"
                  className="font-semibold text-navy-700 hover:text-saffron hover:underline"
                >
                  Terms &amp; Conditions
                </Link>
                . Updates are sent to your WhatsApp number.
              </p>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4">
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="border-b border-border bg-navy-700 px-4 py-3 text-white">
                <p className="text-sm font-semibold">Schedule & registration</p>
                <p className="mt-0.5 text-xs text-white/75">Key dates for this session</p>
              </div>
              <div className="space-y-3 px-4 py-4">
                <ScheduleRow label="Hearing" value={formatWhen(hearing.hearing_date)} />
                <ScheduleRow
                  label="Registration opens"
                  value={formatWhen(hearing.registration_opens_at)}
                />
                <ScheduleRow
                  label="Registration closes"
                  value={formatWhen(hearing.registration_closes_at)}
                  hint={
                    hearing.registration_open
                      ? formatCountdown(hearing.registration_closes_at, "Closes")
                      : undefined
                  }
                />
                {hearing.hearing_end_at ? (
                  <ScheduleRow label="Ends" value={formatWhen(hearing.hearing_end_at)} />
                ) : null}
              </div>
              <div className="border-t border-border px-4 py-4">
                <p className="text-sm text-slate-600">
                  {hearing.registration_open
                    ? "Registration is open. Submit your grievance for this hearing."
                    : "Registration is not open for this hearing right now."}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {hearing.registration_open ? (
                    <Link
                      href={`/hearing/${hearing.id}/register`}
                      className="inline-flex items-center justify-center rounded-lg bg-saffron px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-saffron/90"
                    >
                      Register grievance
                      <Icon name="chevron-right" size={16} className="ml-1.5" />
                    </Link>
                  ) : null}
                  <Link
                    href="/hearing"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:bg-surface-muted"
                  >
                    Back to hearings
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

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

function RegistrationBadge({ open, status }: { open: boolean; status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
        open
          ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-50"
          : "border-white/20 bg-white/10 text-white/85",
      )}
    >
      {open ? "● Open" : status.replaceAll("_", " ")}
    </span>
  );
}
