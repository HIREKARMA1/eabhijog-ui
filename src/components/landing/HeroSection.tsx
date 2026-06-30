"use client";

import { LinkButton } from "@/components/ui/LinkButton";
import { useI18n } from "@/lib/i18n/context";
import type { PortalStats } from "@/types/api";

type HeroSectionProps = {
  stats: PortalStats;
  whatsappUrl: string;
};

export function HeroSection({ stats, whatsappUrl }: HeroSectionProps) {
  const { t } = useI18n();

  return (
    <section className="bg-surface py-16 md:py-20">
      <div className="mx-auto grid max-w-[1120px] gap-10 px-5 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-success">
            {t("landing", "hero.badge")}
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            {t("landing", "hero.headlineLine1")}
            <br />
            <span className="text-saffron">{t("landing", "hero.headlineLine2")}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            {t("landing", "hero.lead")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={whatsappUrl} variant="primary" className="px-5 py-3" external>
              {t("landing", "hero.whatsappCta")}
            </LinkButton>
            <LinkButton href="/login" variant="outline" className="px-5 py-3">
              {t("landing", "hero.officerSignIn")}
            </LinkButton>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">
                {t("landing", "hero.statDistricts")}
              </dt>
              <dd className="text-2xl font-bold text-slate-900">{stats.district_count}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">
                {t("landing", "hero.statMedian")}
              </dt>
              <dd className="text-2xl font-bold text-slate-900">{stats.median_reply_display}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">
                {t("landing", "hero.statResolution")}
              </dt>
              <dd className="text-2xl font-bold text-slate-900">{stats.resolution_rate_display}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
