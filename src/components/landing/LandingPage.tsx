"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { useI18n } from "@/lib/i18n/context";
import { assets } from "@/theme";
import { cn } from "@/lib/utils/cn";
import type { PortalDepartment, PortalGrievancePreview } from "@/types/api";

type LandingPageProps = {
  whatsappUrl: string;
  departments: PortalDepartment[];
  recentGrievances: PortalGrievancePreview[];
  stats: Record<string, string>;
};

const FLOW_KEYS = ["flow1", "flow2", "flow3", "flow4", "flow5", "flow6"] as const;
const PROBLEM_KEYS = ["1", "2", "3", "4"] as const;
const WA_STEP_KEYS = ["1", "2", "3", "4", "5"] as const;
const HEARING_STEP_KEYS = ["1", "2", "3", "4"] as const;
const NOTIF_KEYS = ["n1", "n2", "n3", "n4", "n5", "n6"] as const;
const SERVICE_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
const BENEFIT_KEYS = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;
const FALLBACK_DESK_KEYS = ["d1", "d2", "d3"] as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function LandingPage({
  whatsappUrl,
  departments,
  recentGrievances,
  stats,
}: LandingPageProps) {
  const { t, locale } = useI18n();
  const [visible, setVisible] = useState(false);
  const L = (key: string, params?: Record<string, string | number>) => t("landing", key, params);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    document.title = L("meta.title");
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps -- L changes with locale via t

  return (
    <div className="flex min-h-screen flex-col bg-surface text-slate-900" lang={locale}>
      <GovtNavbar homeHref="/" />

      <main>
        <section
          className={cn(
            "relative overflow-hidden border-b border-border bg-white transition-all duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 75% 60% at 90% 10%, rgb(234 88 12 / 0.10), transparent 55%),
                radial-gradient(ellipse 55% 50% at 5% 90%, rgb(30 58 95 / 0.07), transparent 50%),
                linear-gradient(180deg, #fffaf5 0%, #ffffff 45%, #f8fafc 100%),
                radial-gradient(circle at 1px 1px, rgb(30 58 95 / 0.07) 1px, transparent 0)
              `,
              backgroundSize: "auto, auto, auto, 28px 28px",
              backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
            }}
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-[1920px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14 lg:px-10 lg:py-16">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                {L("hero.badge")}
              </p>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                {L("hero.headline1")}
                <span className="text-saffron">{L("hero.headline2")}</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">{L("hero.lead")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-saffron px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-saffron-hover"
                >
                  <WhatsAppIcon />
                  {L("hero.whatsappCta")}
                </a>
                <Link
                  href="/hearing"
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-600"
                >
                  {L("hero.hearingCta")}
                </Link>
              </div>
              <p className="mt-4 text-sm text-text-muted">{L("hero.statusHint")}</p>
            </div>

            <div
              className={cn(
                "relative mx-auto w-full max-w-[380px] transition-all delay-150 duration-700",
                visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              <div className="overflow-hidden rounded-[1.25rem] border border-[#111b21]/20 shadow-[0_12px_40px_rgba(17,27,33,0.22)]">
                <div className="flex items-center gap-2 bg-[#008069] px-3 py-2.5 text-white">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-white/30">
                    <Image
                      src={assets.whatsappAvatar}
                      alt={L("hero.botName")}
                      fill
                      className="object-cover"
                      sizes="40px"
                      priority
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold leading-tight">{L("hero.botName")}</p>
                    <p className="truncate text-[12px] leading-tight text-white/85">
                      {L("hero.botPhone")}
                      <span className="mx-1 text-white/50">·</span>
                      {L("hero.botStatus")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 pr-1 text-white/95" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-3.5-3.5" />
                    </svg>
                    <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
                      <circle cx="2" cy="2" r="1.5" />
                      <circle cx="2" cy="8" r="1.5" />
                      <circle cx="2" cy="14" r="1.5" />
                    </svg>
                  </div>
                </div>

                <div
                  className="relative space-y-2 px-3 py-4"
                  style={{
                    backgroundColor: "#efeae2",
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d1ccc4' fill-opacity='0.35'%3E%3Cpath d='M10 10h2v2h-2zm20 0h2v2h-2zm20 0h2v2h-2zM0 30h2v2H0zm20 0h2v2h-2zm20 0h2v2h-2zm20 0h2v2h-2zM10 50h2v2h-2zm20 0h2v2h-2zm20 0h2v2h-2z'/%3E%3C/g%3E%3C/svg%3E\")",
                  }}
                >
                  <div className="flex justify-end">
                    <div className="relative max-w-[88%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-2.5 pb-4 pt-1.5 shadow-sm">
                      <p className="text-[13.5px] leading-snug text-[#111b21]">{L("hero.mockIn")}</p>
                      <span className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[10px] text-[#667781]">
                        {L("hero.mockTimeIn")}
                        <svg width="16" height="11" viewBox="0 0 16 11" className="text-[#53bdeb]" aria-hidden>
                          <path
                            fill="currentColor"
                            d="M11.07.34 5.4 6.86 2.93 4.34 1.5 5.8l3.9 3.97 7.1-8.14zM14.5 1.66 8.83 8.18 7.7 7.02l-1.43 1.46 2.56 2.61 7.1-8.14z"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="relative max-w-[90%] rounded-lg rounded-tl-none bg-white px-2.5 pb-4 pt-1.5 shadow-sm">
                      <p className="text-[13.5px] leading-snug text-[#111b21]">{L("hero.mockOut")}</p>
                      <span className="absolute bottom-1 right-2 text-[10px] text-[#667781]">
                        {L("hero.mockTimeOut")}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="px-2 pb-2.5 pt-1"
                  style={{
                    backgroundColor: "#efeae2",
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d1ccc4' fill-opacity='0.35'%3E%3Cpath d='M10 10h2v2h-2zm20 0h2v2h-2zm20 0h2v2h-2zM0 30h2v2H0zm20 0h2v2h-2zm20 0h2v2h-2zm20 0h2v2h-2zM10 50h2v2h-2zm20 0h2v2h-2zm20 0h2v2h-2z'/%3E%3C/g%3E%3C/svg%3E\")",
                  }}
                >
                  <div className="flex items-center gap-2.5 rounded-full bg-[#202c33] px-3.5 py-2.5 text-white shadow-md">
                    <span className="shrink-0 text-[#8696a0]" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                    <span className="shrink-0 text-[#8696a0]" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm0 18a8 8 0 1 1-.001-16.001A8 8 0 0 1 12 20zM8.5 10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8.2 14.2a4.5 4.5 0 0 0 7.6 0l-1.25-.9a2.85 2.85 0 0 1-5.1 0l-1.25.9z" />
                      </svg>
                    </span>
                    <div className="flex min-w-0 flex-1 items-center gap-0.5 text-[14px] text-[#8696a0]">
                      <span className="inline-block h-[14px] w-[1.5px] animate-pulse bg-[#25d366]" aria-hidden />
                      <span className="truncate">{L("hero.inputPlaceholder")}</span>
                    </div>
                    <span className="shrink-0 text-[#8696a0]" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solve" className="scroll-mt-8 border-b border-border bg-surface">
          <div className="mx-auto max-w-[1920px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
            <SectionHeader label={L("solve.label")} title={L("solve.title")} lead={L("solve.lead")} />

            <ol className="mt-10 flex flex-wrap items-stretch justify-center gap-2 lg:gap-0">
              {FLOW_KEYS.map((key, i) => (
                <li key={key} className="flex items-center gap-2">
                  <div className="flex h-full min-w-[7.5rem] flex-col items-center rounded-lg border border-border bg-white px-3 py-4 text-center shadow-sm sm:min-w-[8.5rem]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="mt-2 text-xs font-bold text-navy-800 sm:text-sm">{L(`solve.${key}`)}</span>
                  </div>
                  {i < FLOW_KEYS.length - 1 ? (
                    <span className="hidden text-saffron lg:inline" aria-hidden>
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {PROBLEM_KEYS.map((n) => (
                <article
                  key={n}
                  className="grid gap-0 overflow-hidden rounded-xl border border-border bg-white sm:grid-cols-2"
                >
                  <div className="border-b border-border bg-slate-50 px-5 py-5 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-danger">{L("solve.challenge")}</p>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{L(`solve.p${n}Problem`)}</h3>
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-success">{L("solve.howWeHelp")}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{L(`solve.p${n}Solution`)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="whatsapp" className="scroll-mt-8 border-b border-border bg-white">
          <div className="mx-auto max-w-[1920px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
            <div className="lg:flex lg:items-end lg:justify-between lg:gap-10">
              <SectionHeader label={L("whatsapp.label")} title={L("whatsapp.title")} lead={L("whatsapp.lead")} />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-lg bg-saffron px-4 py-2.5 text-sm font-bold text-white hover:bg-saffron-hover lg:mt-0"
              >
                <WhatsAppIcon />
                {L("whatsapp.cta")}
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {WA_STEP_KEYS.map((n) => (
                <article
                  key={n}
                  className="relative rounded-xl border border-border bg-surface px-4 py-5 transition hover:border-saffron/40 hover:shadow-sm"
                >
                  <span className="text-3xl font-extrabold text-saffron/25">{n}</span>
                  <h3 className="mt-1 text-sm font-bold text-navy-800">{L(`whatsapp.s${n}Title`)}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{L(`whatsapp.s${n}Body`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="hearing" className="scroll-mt-8 border-b border-border bg-surface">
          <div className="mx-auto max-w-[1920px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <SectionHeader label={L("hearing.label")} title={L("hearing.title")} lead={L("hearing.lead")} />
                <div className="mt-8 space-y-4">
                  {HEARING_STEP_KEYS.map((n) => (
                    <div key={n} className="flex gap-4 rounded-lg border border-border bg-white p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-700 text-sm font-bold text-white">
                        {n}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{L(`hearing.s${n}Title`)}</h3>
                        <p className="mt-1 text-sm text-slate-600">{L(`hearing.s${n}Body`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/hearing"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-navy-700 px-4 py-2.5 text-sm font-bold text-navy-700 transition hover:bg-navy-700 hover:text-white"
                >
                  {L("hearing.cta")}
                </Link>
              </div>

              <div id="notifications" className="scroll-mt-8">
                <SectionHeader
                  label={L("notifications.label")}
                  title={L("notifications.title")}
                  lead={L("notifications.lead")}
                />
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {NOTIF_KEYS.map((key) => (
                    <li
                      key={key}
                      className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-[10px] font-bold text-white">
                        ✓
                      </span>
                      <span className="text-sm font-semibold text-emerald-900">{L(`notifications.${key}`)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl border border-border bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-saffron">{L("notifications.exampleLabel")}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{L("notifications.exampleBody")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-8 border-b border-border bg-white">
          <div className="mx-auto max-w-[1920px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
            <SectionHeader label={L("services.label")} title={L("services.title")} lead={L("services.lead")} />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICE_KEYS.map((n) => (
                <article
                  key={n}
                  className="rounded-xl border border-border bg-surface p-5 transition hover:border-saffron/35 hover:bg-white hover:shadow-sm"
                >
                  <div className="mb-3 h-1 w-10 rounded-full bg-saffron" />
                  <h3 className="text-sm font-bold text-navy-800">{L(`services.s${n}Title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{L(`services.s${n}Body`)}</p>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-xl border border-navy-700/15 bg-navy-900 px-6 py-8 text-white sm:px-10">
              <h3 className="text-lg font-bold sm:text-xl">{L("services.benefitsTitle")}</h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BENEFIT_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-orange-50">
                    <span className="mt-1 text-saffron" aria-hidden>
                      ●
                    </span>
                    {L(`services.${key}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12" id="departments">
              <h3 className="text-lg font-bold text-slate-900">
                {L("services.desksTitle", {
                  categories: stats.onboarded_categories,
                  districts: stats.district_count,
                })}
              </h3>
              <p className="mt-1 text-sm text-text-muted">{L("services.desksLead")}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {departments.length === 0
                  ? FALLBACK_DESK_KEYS.map((key) => (
                      <div key={key} className="rounded-lg border border-border bg-surface px-4 py-3">
                        <p className="font-semibold text-navy-800">{L(`fallbackDesks.${key}`)}</p>
                      </div>
                    ))
                  : departments.map((dept) => (
                      <div key={`${dept.slug}-${dept.name}`} className="rounded-lg border border-border bg-surface px-4 py-3">
                        <p className="font-semibold text-navy-800">{dept.name}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {dept.count ? `${dept.count} ${L("services.totalSuffix")}` : dept.kind}
                          {dept.open_count ? ` · ${dept.open_count} ${L("services.openSuffix")}` : ""}
                        </p>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </section>

        <section id="minister" className="scroll-mt-8 border-b border-border bg-surface">
          <div className="mx-auto max-w-[1920px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:grid lg:grid-cols-[280px_1fr]">
              <div className="relative min-h-[320px] bg-navy-900 lg:min-h-full">
                <Image
                  src={assets.ministerPortrait}
                  alt={t("common", "navbar.ministerAlt")}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 280px"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/95 via-navy-950/50 to-transparent px-5 pb-5 pt-16">
                  <p className="text-lg font-extrabold text-white">{t("common", "navbar.ministerName")}</p>
                  <p className="text-sm font-semibold text-orange-200">{t("common", "navbar.ministerSubtitle")}</p>
                </div>
              </div>
              <div className="flex flex-col justify-center px-6 py-8 sm:px-10 lg:py-12">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">{L("minister.label")}</p>
                <blockquote className="mt-4 text-lg font-medium leading-relaxed text-slate-800 sm:text-xl sm:leading-relaxed">
                  {L("minister.quote")}
                </blockquote>
                <p className="mt-6 text-sm font-bold text-navy-700">— {t("common", "navbar.ministerName")}</p>
                <p className="text-sm text-text-muted">{t("common", "navbar.ministerSubtitle")}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="impact" className="border-b border-border bg-navy-900 text-white">
          <div className="mx-auto max-w-[1920px] px-4 py-12 sm:px-6 lg:px-10 lg:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{L("impact.label")}</p>
            <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
              <ImpactStat value={stats.district_count} label={L("impact.districts")} />
              <ImpactStat value={stats.median_reply} label={L("impact.median")} />
              <ImpactStat value={`${stats.resolution_rate}%`} label={L("impact.resolution")} />
              <ImpactStat value={stats.total_grievances} label={L("impact.total")} />
            </div>

            {recentGrievances.length > 0 ? (
              <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-navy-800/60">
                <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-orange-100">
                  {L("impact.recent")}
                </div>
                <ul className="divide-y divide-white/5">
                  {recentGrievances.slice(0, 5).map((item) => (
                    <li
                      key={item.reference_number}
                      className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm text-slate-200"
                    >
                      <span className="font-bold text-white">#{item.reference_number}</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{item.district}</span>
                      <span className="rounded bg-saffron/20 px-2 py-0.5 text-xs text-orange-200">{item.category}</span>
                      <span className="ml-auto text-xs text-slate-400">{item.sla_label || item.status_label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1920px] px-4 py-14 sm:px-6 lg:px-10">
            <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-border bg-surface px-6 py-10 sm:px-10 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">{L("cta.label")}</p>
                <h2 className="mt-3 text-2xl font-extrabold text-navy-900 sm:text-3xl">{L("cta.title")}</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-600">{L("cta.lead")}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-saffron px-5 py-3 text-sm font-bold text-white hover:bg-saffron-hover"
                >
                  <WhatsAppIcon />
                  {L("cta.whatsapp")}
                </a>
                <Link
                  href="/hearing"
                  className="inline-flex items-center rounded-lg border border-border bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-surface"
                >
                  {L("cta.hearing")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PortalFooter whatsappUrl={whatsappUrl} />
    </div>
  );
}

function SectionHeader({ label, title, lead }: { label: string; title: string; lead: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">{label}</p>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{lead}</p>
    </div>
  );
}

function ImpactStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-extrabold text-white sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-400">{label}</p>
    </div>
  );
}
