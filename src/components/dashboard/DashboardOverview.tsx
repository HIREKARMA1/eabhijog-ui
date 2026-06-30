import Link from "next/link";

import { Bi } from "@/lib/i18n/bi";
import type { DashboardSummary, GrievanceRow } from "@/types/api";

type DashboardOverviewProps = {
  summary: DashboardSummary;
  grievances: GrievanceRow[];
  kpi: Record<string, number>;
  isSuperAdmin: boolean;
};

export function DashboardOverview({ summary, grievances, kpi, isSuperAdmin }: DashboardOverviewProps) {
  const openCount = summary.new_count + summary.in_progress_count;

  return (
    <>
      <div className="portal-hero">
        <div className="portal-hero-inner">
          <div className="portal-hero-intro">
            <div className="portal-hero-icon" aria-hidden="true">
              📊
            </div>
            <div>
              <div className="portal-hero-label">
                <Bi en="Citizen redressal command centre" or="ନାଗରିକ ପୁରସ୍କାର କମାଣ୍ଡ ସେଣ୍ଟର" />
              </div>
              <h1 className="portal-hero-title">
                <Bi en="Executive Dashboard" or="କାର୍ଯ୍ୟାନ୍ୱୟ ଡ୍ୟାସବୋର୍ଡ" />
              </h1>
              <p className="portal-hero-sub">
                <strong>{summary.total_count}</strong>{" "}
                <Bi en="grievances on record across 30 districts —" or="ଓଡ଼ିଶାର ୩୦ ଜିଲ୍ଲାରେ ମୋଟ ଅଭିଯୋଗ —" />{" "}
                <strong>{openCount}</strong> <Bi en="awaiting action." or="କାର୍ଯ୍ୟ ବାକି।" />
              </p>
            </div>
          </div>
          <div className="portal-hero-actions">
            <span className="portal-live-pill">
              <span className="api-status-dot" /> <Bi en="WhatsApp · Live" or="WhatsApp · ଲାଇଭ୍" />
            </span>
            <Link href="/dashboard/grievances" className="btn btn-saffron">
              <Bi en="Open grievances" or="ଅଭିଯୋଗ ଖୋଲନ୍ତୁ" />
            </Link>
          </div>
        </div>

        <div className="portal-hero-stats">
          <div className="portal-stat red">
            <div className="portal-stat-icon">⚡</div>
            <div>
              <div className="portal-stat-label">
                <Bi en="Overdue SLA" or="SLA ଅତିକାଳ" />
              </div>
              <div className="portal-stat-value">{kpi.overdue_sla ?? 0}</div>
              <div className="portal-stat-foot">
                <Bi en="Immediate action needed" or="ତତ୍କ୍ଷଣାତ୍ କାର୍ଯ୍ୟ" />
              </div>
            </div>
          </div>
          <div className="portal-stat purple">
            <div className="portal-stat-icon">📱</div>
            <div>
              <div className="portal-stat-label">
                <Bi en="Active today" or="ଆଜି ସକ୍ରିୟ" />
              </div>
              <div className="portal-stat-value">{kpi.active_today ?? 0}</div>
              <div className="portal-stat-foot">
                <Bi en="New WhatsApp submissions" or="ନୂଆ WhatsApp ଅଭିଯୋଗ" />
              </div>
            </div>
          </div>
          <div className="portal-stat green">
            <div className="portal-stat-icon">✓</div>
            <div>
              <div className="portal-stat-label">
                <Bi en="Resolved" or="ସମାଧାନ" />
              </div>
              <div className="portal-stat-value">{kpi.resolved_30d ?? 0}</div>
              <div className="portal-stat-foot">
                <strong>{kpi.satisfaction_pct ?? 0}%</strong> <Bi en="satisfaction" or="ସନ୍ତୁଷ୍ଟି" />
              </div>
            </div>
          </div>
          <div className="portal-stat blue">
            <div className="portal-stat-icon">💬</div>
            <div>
              <div className="portal-stat-label">
                <Bi en="WhatsApp inflow" or="WhatsApp ପ୍ରବାହ" />
              </div>
              <div className="portal-stat-value">{kpi.whatsapp_active ?? 0}</div>
              <div className="portal-stat-foot">
                <Bi en="Last 7 days" or="ଗତ ୭ ଦିନ" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-actions">
        <Link href="/dashboard/grievances" className="portal-action-card saffron">
          <span className="action-icon">📋</span>
          <span className="portal-action-title">
            <Bi en="Grievance workspace" or="ଅଭିଯୋଗ କାର୍ଯ୍ୟକ୍ଷେତ୍ର" />
          </span>
          <span className="portal-action-desc">
            <Bi
              en="Review cases, reply via WhatsApp, and advance lifecycle stages."
              or="କେସ ସମୀକ୍ଷା, WhatsApp ଉତ୍ତର ଓ ଜୀବନଚକ୍ର।"
            />
          </span>
          <span className="portal-action-cta">
            <Bi en="Open workspace →" or="କାର୍ଯ୍ୟକ୍ଷେତ୍ର ଖୋଲନ୍ତୁ →" />
          </span>
        </Link>
        <Link href="/dashboard/analytics" className="portal-action-card blue">
          <span className="action-icon">📈</span>
          <span className="portal-action-title">
            <Bi en="Analytics hub" or="ବିଶ୍ଳେଷଣ ହବ୍" />
          </span>
          <span className="portal-action-cta">
            <Bi en="View reports →" or="ରିପୋର୍ଟ ଦେଖନ୍ତୁ →" />
          </span>
        </Link>
        <a href="/backend/dashboard/export" className="portal-action-card green">
          <span className="action-icon">📥</span>
          <span className="portal-action-title">
            <Bi en="Export CSV" or="CSV ରପ୍ତାନ" />
          </span>
          <span className="portal-action-cta">
            <Bi en="Download →" or="ଡାଉନଲୋଡ୍ →" />
          </span>
        </a>
        <Link href="/dashboard/staff" className="portal-action-card violet">
          <span className="action-icon">👥</span>
          <span className="portal-action-title">
            {isSuperAdmin ? (
              <Bi en="Admin accounts" or="ଆଡମିନ ଖାତା" />
            ) : (
              <Bi en="OSD accounts" or="OSD ଖାତା" />
            )}
          </span>
          <span className="portal-action-cta">
            <Bi en="Manage →" or="ପରିଚାଳନା →" />
          </span>
        </Link>
      </div>

      <div className="portal-recent">
        <div className="portal-recent-header">
          <h2 className="portal-recent-title">
            <Bi en="Recent submissions" or="ସାମ୍ପ୍ରତିକ ଅଭିଯୋଗ" />
          </h2>
          <Link href="/dashboard/grievances" className="btn btn-outline text-xs">
            <Bi en="View all" or="ସମସ୍ତ ଦେଖନ୍ତୁ" />
          </Link>
        </div>
        {grievances.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            <Bi en="No grievances on record yet." or="ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅଭିଯୋଗ ନାହିଁ।" />
          </p>
        ) : (
          grievances.map((g) => {
            const closed = ["closed", "resolved", "action_taken"].includes(g.status);
            const pending = g.status === "pending_review";
            return (
              <Link
                key={g.reference_number}
                href={`/dashboard/grievances?ref=${g.reference_number}`}
                className="portal-recent-row"
              >
                <span className="portal-recent-ref">#{g.reference_number}</span>
                <span className="portal-recent-meta">
                  <span className="portal-recent-name">{g.citizen_name ?? "Citizen"}</span>
                  <span className="portal-recent-sub">
                    {g.district} · {g.category ?? g.osd_category}
                  </span>
                </span>
                <span
                  className={`portal-recent-badge ${closed ? "resolved" : pending ? "pending" : "processing"}`}
                >
                  {g.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
