"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LangSwitcher } from "@/components/i18n/LangSwitcher";
import { Bi } from "@/lib/i18n/bi";
import { useI18n } from "@/lib/i18n/context";
import type { PortalDepartment, PortalGrievancePreview } from "@/types/api";

type LandingPageProps = {
  whatsappUrl: string;
  appVersion: string;
  departments: PortalDepartment[];
  recentGrievances: PortalGrievancePreview[];
  stats: Record<string, string>;
};

export function LandingPage({
  whatsappUrl,
  appVersion,
  departments,
  recentGrievances,
  stats,
}: LandingPageProps) {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const toggle = document.getElementById("landing-nav-toggle");
    const menu = document.getElementById("landing-mobile-menu");

    function onToggle() {
      setMobileOpen((open) => {
        const next = !open;
        toggle?.setAttribute("aria-expanded", next ? "true" : "false");
        if (menu) menu.hidden = !next;
        return next;
      });
    }

    toggle?.addEventListener("click", onToggle);
    return () => toggle?.removeEventListener("click", onToggle);
  }, []);

  return (
    <>
      <header className="landing-nav" id="landing-nav">
        <div className="landing-nav-accent" aria-hidden="true" />
        <div className="landing-container landing-nav-container">
          <div className="landing-nav-inner">
            <Link href="/" className="landing-logo">
              <span className="landing-logo-icon" aria-hidden="true">
                OD
              </span>
              <span className="landing-logo-copy">
                <span className="landing-logo-text">{t("common", "brand.name")}</span>
                <span className="landing-logo-sub">
                  <Bi en="Government of Odisha" or="ଓଡ଼ିଶା ସରକାର" />
                </span>
              </span>
            </Link>

            <nav className="landing-nav-links" aria-label="Primary">
              <a href="#how-it-works" className="landing-nav-link">
                <Bi en="How it works" or="କିପରି କାମ କରେ" />
              </a>
              <a href="#departments" className="landing-nav-link">
                <Bi en="Departments" or="ବିଭାଗ" />
              </a>
              <Link href="/login" className="landing-nav-link">
                <Bi en="Dashboard" or="ଡ୍ୟାସବୋର୍ଡ" />
              </Link>
              <Link href="/request-demo" className="landing-nav-link">
                <Bi en="Request demo" or="ଡେମୋ ଅନୁରୋଧ" />
              </Link>
            </nav>

            <div className="landing-nav-actions">
              <div className="landing-nav-util">
                <LangSwitcher />
              </div>
              <button
                type="button"
                className="landing-mobile-toggle"
                id="landing-nav-toggle"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/login" className="l-btn l-btn-ghost l-btn-nav">
                <Bi en="Officer login" or="ଅଧିକାରୀ ଲଗଇନ" />
              </Link>
              <a
                href={whatsappUrl}
                className="l-btn l-btn-orange l-btn-nav l-btn-pill"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Bi en="File grievance" or="ଅଭିଯୋଗ ଦାଖଲ" />{" "}
                <span className="l-btn-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>

            <nav className="landing-mobile-menu" id="landing-mobile-menu" aria-label="Mobile" hidden={!mobileOpen}>
              <div className="landing-mobile-lang">
                <LangSwitcher />
              </div>
              <a href="#how-it-works">
                <Bi en="How it works" or="କିପରି କାମ କରେ" />
              </a>
              <a href="#departments">
                <Bi en="Departments" or="ବିଭାଗ" />
              </a>
              <Link href="/login">
                <Bi en="Dashboard" or="ଡ୍ୟାସବୋର୍ଡ" />
              </Link>
              <Link href="/request-demo">
                <Bi en="Request demo" or="ଡେମୋ ଅନୁରୋଧ" />
              </Link>
              <Link href="/login">
                <Bi en="Officer login" or="ଅଧିକାରୀ ଲଗଇନ" />
              </Link>
              <a href={whatsappUrl} className="landing-mobile-cta" target="_blank" rel="noopener noreferrer">
                <Bi en="File grievance" or="ଅଭିଯୋଗ ଦାଖଲ" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container">
            <div className="landing-hero-grid">
              <div className="hero-content">
                <div className="landing-badges l-reveal" data-delay="0">
                  <span className="l-badge l-badge-green">
                    <span className="pulse-dot" /> TWILIO WHATSAPP
                  </span>
                </div>
                <h1 className="landing-headline">
                  <span className="l-reveal" data-delay="80">
                    <Bi en="Every citizen heard." or="ପ୍ରତ୍ୟେକ ନାଗରିକଙ୍କ କଥା ଶୁଣାଯାଏ।" block />
                  </span>
                  <br />
                  <span className="l-reveal accent" data-delay="160">
                    <Bi en="Every grievance tracked." or="ପ୍ରତ୍ୟେକ ଅଭିଯୋଗ ଟ୍ରାକ୍ ହୁଏ।" block />
                  </span>
                </h1>
                <p className="landing-lead l-reveal" data-delay="240">
                  <Bi
                    en="File a grievance on WhatsApp in Odia or English. Government officers respond from a single command center — with SLAs, audit trails, and accountability that survives transfers and political cycles."
                    or="WhatsApp ମାଧ୍ୟମରେ ଓଡ଼ିଆ କିମ୍ବା ଇଂରାଜୀରେ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ। ସରକାରୀ ଅଧିକାରୀମାନେ ଏକ କମାଣ୍ଡ ସେଣ୍ଟରରୁ ପ୍ରତିଉତ୍ତର ଦିଅନ୍ତି — SLA, ଅଡିଟ୍ ଟ୍ରେଲ୍ ଓ ଜବାବଦାରି ସହ।"
                    block
                  />
                </p>
                <div className="landing-hero-ctas l-reveal" data-delay="400">
                  <a href={whatsappUrl} className="l-btn l-btn-orange l-btn-lg" target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <Bi en="Message on WhatsApp" or="WhatsApp ରେ ମେସେଜ୍" />
                  </a>
                  <Link href="/login" className="l-btn l-btn-outline l-btn-lg">
                    <Bi en="Officer sign in" or="ଅଧିକାରୀ ସାଇନ ଇନ" />
                  </Link>
                </div>
                <div className="landing-mini-stats" id="portal-hero-stats">
                  <div className="l-reveal" data-delay="500">
                    <div className="landing-mini-stat-val" id="portal-stat-districts" data-count-end={stats.district_count}>
                      0
                    </div>
                    <div className="landing-mini-stat-label">
                      <Bi en="Districts" or="ଜିଲ୍ଲା" />
                    </div>
                  </div>
                  <div className="l-reveal" data-delay="600">
                    <div className="landing-mini-stat-val" id="portal-stat-median" data-count-text={stats.median_reply}>
                      {stats.median_reply}
                    </div>
                    <div className="landing-mini-stat-label">
                      <Bi en="Median response" or="ମଧ୍ୟ ପ୍ରତିକ୍ରିୟା" />
                    </div>
                  </div>
                  <div className="l-reveal" data-delay="700">
                    <div
                      className="landing-mini-stat-val"
                      id="portal-stat-resolution"
                      data-count-end={stats.resolution_rate}
                      data-count-suffix="%"
                    >
                      0
                    </div>
                    <div className="landing-mini-stat-label">
                      <Bi en="Resolution" or="ସମାଧାନ" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="wa-mockup-wrap l-reveal-right" id="wa-mockup">
                <div className="wa-mockup">
                  <div className="wa-mockup-header">
                    <span className="wa-avatar">OD</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        <Bi en="Odisha Grievance" or="ଓଡ଼ିଶା ଅଭିଯୋଗ" />
                      </div>
                      <div className="wa-online">
                        <span className="wa-online-dot" /> <Bi en="online" or="ଅନଲାଇନ" /> · +91 ••• 4567
                      </div>
                    </div>
                  </div>
                  <div className="wa-mockup-body" id="wa-chat-body">
                    <div className="wa-typing wa-chat-hidden" id="wa-typing" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="wa-bubble wa-bubble-in wa-chat-hidden" data-chat-order="1">
                      <span className="i18n-en">
                        Namaste, my PDS card has been pending for 3 months at Khordha sub-office. Please help.
                      </span>
                      <span className="i18n-or" lang="or">
                        ନମସ୍କାର, ମୋ PDS କାର୍ଡ ୩ ମାସ ଧରି ଖୋର୍ଦ୍ଧା ଅଫିସରେ ଅଟକିଛି। ଦୟାକରି ସାହାଯ୍ୟ କରନ୍ତୁ।
                      </span>
                      <div className="wa-time">11:45 AM</div>
                    </div>
                    <div className="wa-bubble wa-bubble-out wa-chat-hidden" data-chat-order="2">
                      <span className="i18n-en">Logged as #GRI-9821. An officer will respond within 24 hours.</span>
                      <span className="i18n-or" lang="or">
                        #GRI-9821 ଭାବେ ଲଗ୍ ହେଲା। ୨୪ ଘଣ୍ଟା ଭିତରେ ଅଧିକାରୀ ପ୍ରତିଉତ୍ତର ଦେବେ।
                      </span>
                      <div className="wa-time" style={{ color: "#94a3b8" }}>
                        11:46 AM
                      </div>
                    </div>
                  </div>
                  <div className="wa-mockup-footer wa-chat-hidden" id="wa-footer">
                    <span className="i18n-en">SLA 24H · AUTO-ROUTED</span>
                    <span className="i18n-or" lang="or">
                      SLA ୨୪ଘଣ୍ଟା · ସ୍ୱଚାଳିତ ରୁଟିଂ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-alt" id="how-it-works">
          <div className="landing-container">
            <div className="landing-section-header-row l-reveal">
              <div>
                <div className="l-section-label">
                  <Bi en="How it works" or="କିପରି କାମ କରେ" />
                </div>
                <h2 className="l-section-title">
                  <span className="steps-headline-lead">
                    <Bi
                      en="From a WhatsApp message to a closed grievance —"
                      or="WhatsApp ମେସେଜ୍ ରୁ ସମାଧାନ ପର୍ଯ୍ୟନ୍ତ —"
                      block
                    />
                  </span>
                  <span className="steps-headline-accent">
                    <span className="steps-headline-text">
                      <Bi en="in three steps" or="ତିନି ପଦକ୍ଷେପରେ" />
                    </span>
                    <span className="steps-headline-period">.</span>
                  </span>
                </h2>
              </div>
              <div className="l-section-meta">
                <Bi en="Avg. time to resolution" or="ହାୟ, ସମାଧାନ ସମୟ" /> · {stats.avg_resolution_display}
              </div>
            </div>
            <div className="steps-flow">
              <article className="step-bubble step-bubble--1 l-reveal" data-delay="0">
                <div className="step-bubble-card">
                  <h3 className="step-bubble-title">
                    <Bi en="Citizen messages WhatsApp" or="ନାଗରିକ WhatsApp ରେ ମେସେଜ୍" />
                  </h3>
                  <p className="step-bubble-body">
                    <Bi
                      en="Hi-bot walks through category, district, and a short description. Photos and voice notes are welcome."
                      or="ବଟ୍ ବର୍ଗ, ଜିଲ୍ଲା ଓ ସଂକ୍ଷିପ୍ତ ବର୍ଣ୍ଣନା ନେଇଥାଏ। ଫଟୋ ଓ ଭଏସ୍ ନୋଟ୍ ଗ୍ରହଣ କରାଯାଏ।"
                      block
                    />
                  </p>
                </div>
              </article>
              <article className="step-bubble step-bubble--2 l-reveal" data-delay="120">
                <div className="step-bubble-card">
                  <h3 className="step-bubble-title">
                    <Bi en="Auto-routed to the right desk" or="ଠିକ୍ ଡେସ୍କକୁ ସ୍ୱଚାଳିତ ରୁଟିଂ" />
                  </h3>
                </div>
              </article>
              <article className="step-bubble step-bubble--3 l-reveal" data-delay="240">
                <div className="step-bubble-card">
                  <h3 className="step-bubble-title">
                    <Bi en="Officer responds, citizen confirms" or="ଅଧିକାରୀ ପ୍ରତିଉତ୍ତର, ନାଗରିକ ନିଶ୍ଚିତ" />
                  </h3>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section" id="command-center">
          <div className="landing-container">
            <div className="command-grid">
              <div className="l-reveal">
                <div className="l-section-label">
                  <Bi en="Command center" or="କମାଣ୍ଡ ସେଣ୍ଟର" />
                </div>
                <h2 className="l-section-title">
                  <Bi
                    en="One dashboard. Every district. Every category."
                    or="ଗୋଟିଏ ଡ୍ୟାସବୋର୍ଡ। ପ୍ରତ୍ୟେକ ଜିଲ୍ଲା। ପ୍ରତ୍ୟେକ ବର୍ଗ।"
                    block
                  />
                </h2>
                <Link href="/login" className="l-btn l-btn-outline">
                  <Bi en="Open dashboard preview →" or="ଡ୍ୟାସବୋର୍ଡ ପ୍ରିଭ୍ୟୁ →" />
                </Link>
              </div>
              <div className="dashboard-preview l-reveal-right" id="dashboard-preview">
                <div className="dashboard-preview-bar">
                  <span className="d-dot d-dot-r" />
                  <span className="d-dot d-dot-y" />
                  <span className="d-dot d-dot-g" />
                  <span className="dashboard-url">janasamadhan.odisha.gov.in / dashboard</span>
                  <span className="dashboard-live-badge" id="dashboard-live-badge">
                    <span className="dashboard-live-dot" />
                    <span className="i18n-en">LIVE</span>
                    <span className="i18n-or" lang="or">
                      ଲାଇଭ୍
                    </span>
                  </span>
                </div>
                <div className="dashboard-preview-body">
                  <div className="preview-kpis">
                    {[
                      ["portal-kpi-overdue", "Overdue", "ଅତିକାଳ", stats.preview_overdue, "orange"],
                      ["portal-kpi-active", "Active", "ସକ୍ରିୟ", stats.preview_active, "blue"],
                      ["portal-kpi-resolved", "Resolved", "ସମାଧାନ", stats.preview_resolved, "green"],
                      ["portal-kpi-wa", "WA Active", "WA ସକ୍ରିୟ", stats.preview_wa_active, "green"],
                    ].map(([id, en, or, val, color], index) => (
                      <div key={id} className={`preview-kpi ${color} l-reveal`} data-delay={index * 80}>
                        <div className="preview-kpi-label">
                          <Bi en={en} or={or} />
                        </div>
                        <div
                          className="preview-kpi-val"
                          id={id}
                          data-count-end={String(val).replace(/,/g, "")}
                        >
                          0
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="preview-scroll-viewport l-reveal" data-delay="320" id="portal-preview-viewport">
                    <div className="preview-scroll-track" id="portal-preview-rows">
                      {recentGrievances.length === 0 ? (
                        <div className="preview-empty text-sm text-gray-500 py-4" id="portal-preview-empty">
                          <Bi
                            en="No grievances on record yet — be the first to file via WhatsApp."
                            or="ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅଭିଯୋଗ ନାହିଁ — WhatsApp ମାଧ୍ୟମରେ ପ୍ରଥମେ ଦାଖଲ କରନ୍ତୁ।"
                            block
                          />
                        </div>
                      ) : (
                        recentGrievances.map((item, index) => (
                          <div
                            key={item.reference_number}
                            className={`preview-row-inner${index > 0 ? " l-reveal" : ""}`}
                            data-delay={320 + index * 80}
                          >
                            <strong>#{item.reference_number}</strong> {item.citizen_label}
                            <span className="preview-tag preview-tag-blue">{item.district}</span>
                            <span className="preview-tag preview-tag-orange">{item.category}</span>
                            {item.is_closed ? (
                              <span className="preview-sla-closed preview-closed-label" style={{ marginLeft: "auto", color: "#16a34a", fontWeight: 700 }}>
                                <Bi en="Closed" or="ବନ୍ଦ" />
                              </span>
                            ) : item.is_overdue ? (
                              <span className="preview-sla-red sla-pulse" style={{ marginLeft: "auto" }}>
                                {item.sla_label}
                              </span>
                            ) : (
                              <span style={{ marginLeft: "auto", color: "#64748b" }}>{item.sla_label}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-alt" id="departments">
          <div className="landing-container">
            <div className="l-section-label l-reveal">
              <Bi en="Departments onboarded" or="ଯୋଗ କରାଯାଇଥିବା ବିଭାଗ" />
            </div>
            <h2 className="l-section-title l-reveal" data-delay="80">
              <span className="i18n-en">
                {stats.onboarded_categories} ministerial desks, {stats.district_count} districts, one channel for the
                citizen.
              </span>
              <span className="i18n-or i18n-block" lang="or">
                {stats.onboarded_categories} ମନ୍ତ୍ରୀ ଡେସ୍କ, {stats.district_count} ଜିଲ୍ଲା — ନାଗରିକଙ୍କ ପାଇଁ ଗୋଟିଏ ଚ୍ୟାନେଲ।
              </span>
            </h2>
            <div className="dept-grid" style={{ marginTop: "2rem" }} id="portal-dept-grid">
              {departments.length === 0 ? (
                <p className="text-sm text-gray-500" id="portal-dept-empty">
                  <Bi
                    en="Department statistics will appear as grievances are registered."
                    or="ଅଭିଯୋଗ ପଞ୍ଜିକରଣ ହେବା ସହ ବିଭାଗ ପରିସଂଖ୍ୟା ଦେଖାଯିବ।"
                    block
                  />
                </p>
              ) : (
                departments.map((dept, index) => (
                  <div key={`${dept.slug}-${dept.name}`} className="dept-cell l-reveal" data-delay={index * 40}>
                    <div className="dept-api">
                      {dept.kind === "category" ? `/osd/${dept.slug}` : dept.name}
                      {dept.count ? ` · ${dept.count}` : ""}
                    </div>
                    <div className="dept-name">{dept.name}</div>
                    {dept.open_count ? (
                      <div className="dept-open">
                        {dept.open_count}
                        <span className="i18n-en"> open</span>
                        <span className="i18n-or" lang="or">
                          {" "}
                          ଖୋଲା
                        </span>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="impact-banner" id="impact-banner">
          <div className="landing-container">
            <div className="impact-grid">
              <div className="l-reveal" data-delay="0">
                <div className="impact-val" id="portal-impact-grievances" data-count-end={stats.grievances_30d.replace(/,/g, "")}>
                  0
                </div>
                <div className="impact-label">
                  <Bi en="Grievances handled" or="ଅଭିଯୋଗ ସମାଧାନ" />
                </div>
                <div className="impact-sub">
                  <Bi en="Last 30 days" or="ଗତ ୩୦ ଦିନ" />
                </div>
              </div>
              <div className="l-reveal" data-delay="100">
                <div
                  className="impact-val"
                  id="portal-impact-sla"
                  data-count-end={stats.resolved_on_time.replace("%", "").replace("—", "0")}
                  data-count-suffix={stats.resolved_on_time !== "—" ? "%" : ""}
                >
                  {stats.resolved_on_time}
                </div>
                <div className="impact-label">
                  <Bi en="Resolved on time" or="ସମୟରେ ସମାଧାନ" />
                </div>
              </div>
              <div className="l-reveal" data-delay="200">
                <div className="impact-val" id="portal-impact-median" data-count-text={stats.median_reply}>
                  {stats.median_reply}
                </div>
                <div className="impact-label">
                  <Bi en="Median first reply" or="ମଧ୍ୟ ପ୍ରଥମ ଉତ୍ତର" />
                </div>
              </div>
              <div className="l-reveal" data-delay="300">
                <div className="impact-val" id="portal-impact-total" data-count-end={stats.total_grievances.replace(/,/g, "")}>
                  0
                </div>
                <div className="impact-label">
                  <Bi en="Total on record" or="ମୋଟ ରେକର୍ଡ" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-container">
            <div className="cta-box l-reveal">
              <div>
                <div className="l-section-label">
                  <Bi en="Bring it to your district" or="ଆପଣଙ୍କ ଜିଲ୍ଲାରେ ଆରମ୍ଭ କରନ୍ତୁ" />
                </div>
                <h2 className="l-section-title" style={{ marginBottom: "0.75rem" }}>
                  <Bi
                    en="Replace the complaint register. Keep the accountability."
                    or="ଅଭିଯୋଗ ରେଜିଷ୍ଟର ବଦଳାନ୍ତୁ। ଜବାବଦାରି ରଖନ୍ତୁ।"
                    block
                  />
                </h2>
              </div>
              <div className="cta-actions">
                <Link href="/login" className="l-btn l-btn-orange l-btn-lg">
                  <Bi en="Officer sign in" or="ଅଧିକାରୀ ସାଇନ ଇନ" />
                </Link>
                <Link href="/request-demo" className="l-btn l-btn-outline l-btn-lg">
                  <Bi en="Request demo" or="ଡେମୋ ଅନୁରୋଧ" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-accent" aria-hidden="true" />
        <div className="landing-container">
          <div className="footer-grid">
            <div className="footer-col footer-col-brand">
              <Link href="/" className="footer-logo">
                <span className="footer-logo-icon" aria-hidden="true">
                  OD
                </span>
                <span className="footer-logo-copy">
                  <span className="footer-logo-text">{t("common", "brand.name")}</span>
                  <span className="footer-logo-sub">
                    <Bi en="Government of Odisha" or="ଓଡ଼ିଶା ସରକାର" />
                  </span>
                </span>
              </Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              <Bi en="© 2026 Government of Odisha. All rights reserved." or="© ୨୦୨୬ ଓଡ଼ିଶା ସରକାର। ସର୍ବସ୍ୱ ଅଧିକାର ସଂରକ୍ଷିତ।" />
            </span>
            <span className="footer-version">
              <span className="footer-status-dot" aria-hidden="true" /> v{appVersion} ·{" "}
              <Bi en="status: operational" or="ସ୍ଥିତି: ସଚଳ" />
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
