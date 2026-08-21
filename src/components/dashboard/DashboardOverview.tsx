import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { Section } from "@/components/ui/Section";
import { formatStatusLabel } from "@/lib/grievance/display";
import { Bi } from "@/lib/i18n/bi";
import { cn } from "@/lib/utils/cn";
import type { DashboardSummary, GrievanceRow } from "@/types/api";

type DashboardOverviewProps = {
  summary: DashboardSummary;
  grievances: GrievanceRow[];
  kpi: Record<string, number>;
  isSuperAdmin: boolean;
};

const kpiTiles = [
  {
    key: "overdue",
    icon: "⚡",
    valueKey: "overdue_sla",
    tone: "from-red-600/40 to-red-600/10",
    label: <Bi en="Overdue SLA" or="SLA ଅତିକାଳ" />,
    foot: <Bi en="Immediate action needed" or="ତତ୍କ୍ଷଣାତ୍ କାର୍ଯ୍ୟ" />,
  },
  {
    key: "active",
    icon: "📱",
    valueKey: "active_today",
    tone: "from-violet-600/40 to-violet-600/10",
    label: <Bi en="Active today" or="ଆଜି ସକ୍ରିୟ" />,
    foot: <Bi en="New WhatsApp submissions" or="ନୂଆ WhatsApp ଅଭିଯୋଗ" />,
  },
  {
    key: "resolved",
    icon: "✓",
    valueKey: "resolved_30d",
    tone: "from-emerald-700/40 to-emerald-700/10",
    label: <Bi en="Resolved" or="ସମାଧାନ" />,
  },
  {
    key: "whatsapp",
    icon: "💬",
    valueKey: "whatsapp_active",
    tone: "from-blue-600/40 to-blue-600/10",
    label: <Bi en="WhatsApp inflow" or="WhatsApp ପ୍ରବାହ" />,
    foot: <Bi en="Last 7 days" or="ଗତ ୭ ଦିନ" />,
  },
] as const;

function statusTone(status: string) {
  if (["closed", "resolved", "action_taken"].includes(status)) return "success" as const;
  if (status === "pending_review") return "warning" as const;
  return "info" as const;
}

export function DashboardOverview({ summary, grievances, kpi, isSuperAdmin }: DashboardOverviewProps) {
  const openCount = summary.new_count + summary.in_progress_count;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(125deg,#0b1220_0%,#162236_38%,#1e3a5f_72%,#2d4a6f_100%)] shadow-[0_12px_40px_rgb(15_27_45/0.28)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgb(234_88_12/0.38)_0%,transparent_42%),radial-gradient(circle_at_8%_88%,rgb(59_130_246/0.22)_0%,transparent_38%),radial-gradient(circle_at_50%_50%,rgb(124_58_237/0.12)_0%,transparent_55%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#dc2626,#ea580c,#a855f7,#2563eb,#15803d)]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-5 px-5 pt-6 md:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 text-xl text-white shadow-[0_6px_20px_rgb(124_58_237/0.45)]"
              aria-hidden="true"
            >
              📊
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400">
                <Bi en="Citizen redressal command centre" or="ନାଗରିକ ପୁରସ୍କାର କମାଣ୍ଡ ସେଣ୍ଟର" />
              </p>
              <h1 className="mb-1 text-[clamp(1.45rem,3vw,1.75rem)] font-extrabold tracking-tight text-white">
                <Bi en="Executive Dashboard" or="କାର୍ଯ୍ୟାନ୍ୱୟ ଡ୍ୟାସବୋର୍ଡ" />
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-300">
                <strong className="font-bold text-white">{summary.total_count}</strong>{" "}
                <Bi en="grievances on record across 30 districts -" or="ଓଡ଼ିଶାର ୩୦ ଜିଲ୍ଲାରେ ମୋଟ ଅଭିଯୋଗ -" />{" "}
                <strong className="font-bold text-white">{openCount}</strong>{" "}
                <Bi en="awaiting action." or="କାର୍ଯ୍ୟ ବାକି ।" />
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/35 bg-emerald-700/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
              <Bi en="WhatsApp · Live" or="WhatsApp · ଲାଇଭ୍" />
            </span>
            <LinkButton href="/dashboard/grievances" className="text-xs">
              <Bi en="Open grievances" or="ଅଭିଯୋଗ ଖୋଲନ୍ତୁ" />
            </LinkButton>
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 px-5 pb-6 sm:grid-cols-2 md:px-6 xl:grid-cols-4">
          {kpiTiles.map((tile) => (
            <div
              key={tile.key}
              className={cn(
                "flex items-center gap-3 rounded-[0.9rem] border border-white/12 bg-linear-to-br p-4 backdrop-blur-sm transition hover:-translate-y-0.5",
                tile.tone,
              )}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg"
                aria-hidden="true"
              >
                {tile.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300/80">{tile.label}</p>
                <p className="text-2xl font-extrabold leading-tight text-white">{kpi[tile.valueKey] ?? 0}</p>
                <p className="mt-0.5 text-[11px] text-slate-300/70">
                  {tile.key === "resolved" ? (
                    <>
                      <strong className="font-semibold text-white">{kpi.satisfaction_pct ?? 0}%</strong>{" "}
                      <Bi en="satisfaction" or="ସନ୍ତୁଷ୍ଟି" />
                    </>
                  ) : (
                    tile.foot
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/grievances"
          className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface-card p-4 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-200 to-orange-300 text-lg">
            📋
          </span>
          <span className="text-[0.95rem] font-bold text-slate-900">
            <Bi en="Grievance workspace" or="ଅଭିଯୋଗ କାର୍ଯ୍ୟକ୍ଷେତ୍ର" />
          </span>
          <span className="text-xs leading-snug text-text-muted">
            <Bi
              en="Review cases, reply via WhatsApp, and advance lifecycle stages."
              or="କେସ ସମୀକ୍ଷା, WhatsApp ଉତ୍ତର ଓ ଜୀବନଚକ୍ର ।"
            />
          </span>
          <span className="mt-auto text-xs font-bold text-navy-700">
            <Bi en="Open workspace →" or="କାର୍ଯ୍ୟକ୍ଷେତ୍ର ଖୋଲନ୍ତୁ →" />
          </span>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface-card p-4 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-200 to-blue-300 text-lg">
            📈
          </span>
          <span className="text-[0.95rem] font-bold text-slate-900">
            <Bi en="Analytics hub" or="ବିଶ୍ଳେଷଣ ହବ୍" />
          </span>
          <span className="mt-auto text-xs font-bold text-navy-700">
            <Bi en="View reports →" or="ରିପୋର୍ଟ ଦେଖନ୍ତୁ →" />
          </span>
        </Link>

        <a
          href="/backend/dashboard/export"
          className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface-card p-4 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-200 to-emerald-300 text-lg">
            📥
          </span>
          <span className="text-[0.95rem] font-bold text-slate-900">
            <Bi en="Export CSV" or="CSV ରପ୍ତାନ" />
          </span>
          <span className="mt-auto text-xs font-bold text-navy-700">
            <Bi en="Download →" or="ଡାଉନଲୋଡ୍ →" />
          </span>
        </a>

        <Link
          href="/dashboard/staff"
          className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface-card p-4 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-200 to-violet-300 text-lg">
            👥
          </span>
          <span className="text-[0.95rem] font-bold text-slate-900">
            {isSuperAdmin ? (
              <Bi en="Admin accounts" or="ଆଡମିନ ଖାତା" />
            ) : (
              <Bi en="OSD accounts" or="OSD ଖାତା" />
            )}
          </span>
          <span className="mt-auto text-xs font-bold text-navy-700">
            <Bi en="Manage →" or="ପରିଚାଳନା →" />
          </span>
        </Link>
      </div>

      <Section
        title={<Bi en="Recent submissions" or="ସାମ୍ପ୍ରତିକ ଅଭିଯୋଗ" />}
        action={
          <LinkButton href="/dashboard/grievances" variant="outline" className="text-xs">
            <Bi en="View all" or="ସମସ୍ତ ଦେଖନ୍ତୁ" />
          </LinkButton>
        }
      >
        <Card className="overflow-hidden p-0 md:p-0">
          {grievances.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-muted">
              <Bi en="No grievances on record yet." or="ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅଭିଯୋଗ ନାହିଁ ।" />
            </p>
          ) : (
            grievances.map((g) => (
              <Link
                key={g.reference_number}
                href={`/dashboard/grievances?ref=${g.reference_number}`}
                className="flex items-center gap-4 border-b border-slate-100 px-5 py-3.5 no-underline last:border-b-0 hover:bg-slate-50"
              >
                <span className="min-w-36 font-mono text-xs font-bold text-blue-700">
                  #{g.reference_number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {g.citizen_name ?? "Citizen"}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {g.district} · {g.category ?? g.osd_category}
                  </span>
                </span>
                <Badge tone={statusTone(g.status)} className="shrink-0 whitespace-nowrap">
                  {formatStatusLabel(g.status).replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              </Link>
            ))
          )}
        </Card>
      </Section>
    </div>
  );
}
