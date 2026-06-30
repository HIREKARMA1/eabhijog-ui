import Link from "next/link";

import { Bi } from "@/lib/i18n/bi";
import { portalStatsToDisplay } from "@/lib/portal/stats";

type AuthPanelProps = {
  stats?: Record<string, string>;
  appVersion?: string;
};

export function AuthPanel({
  stats = portalStatsToDisplay(null),
  appVersion = "2.0.0",
}: AuthPanelProps) {
  return (
    <aside className="auth-panel">
      <div className="auth-panel-glow" aria-hidden="true" />
      <div className="auth-panel-orbs" aria-hidden="true">
        <span className="auth-orb auth-orb-a" />
        <span className="auth-orb auth-orb-b" />
      </div>

      <Link href="/" className="auth-panel-brand auth-anim" data-delay="0">
        <span className="auth-panel-icon auth-panel-icon-wheel">
          <img src="/static/images/auth-konark-wheel.svg" alt="" width={32} height={32} />
        </span>
        <span>
          <div className="auth-panel-name">e-Abhijog</div>
          <div className="auth-panel-gov">
            <Bi en="Government of Odisha" or="ଓଡ଼ିଶା ସରକାର" />
          </div>
        </span>
      </Link>

      <div className="auth-panel-main">
        <div className="auth-panel-label auth-anim" data-delay="80">
          <Bi en="Officer portal · Janaseva" or="ଅଧିକାରୀ ପୋର୍ଟାଲ · ଜନସେବା" />
        </div>
        <h1 className="auth-panel-headline">
          <span className="auth-anim" data-delay="160">
            <Bi en="Every citizen heard." or="ପ୍ରତ୍ୟେକ ନାଗରିକଙ୍କ କଥା ଶୁଣାଯାଏ।" block />
          </span>
          <br />
          <span className="auth-anim accent" data-delay="240">
            <Bi en="From Puri to Koraput." or="ପୁରୀ ରୁ କୋରାପୁଟ ପର୍ଯ୍ୟନ୍ତ।" block />
          </span>
        </h1>
        <p className="auth-panel-desc auth-anim" data-delay="320">
          <Bi
            en="Sign in to serve your district — WhatsApp grievances in Odia & English, SLA tracking, and field coordination from Bhubaneswar to block level."
            or="ଆପଣଙ୍କ ଜିଲ୍ଲାର ସେବା ପାଇଁ ସାଇନ ଇନ କରନ୍ତୁ — ଓଡ଼ିଆ ଓ ଇଂରାଜୀରେ WhatsApp ଅଭିଯୋଗ, SLA ଟ୍ରାକିଂ, ଭୁବନେଶ୍ୱରରୁ ବ୍ଲକ୍ ପର୍ଯ୍ୟନ୍ତ ସମନ୍ୱୟ।"
            block
          />
        </p>

        <div className="auth-panel-scene auth-anim" data-delay="380" aria-hidden="true">
          <img
            src="/static/images/auth-flow-scene.svg"
            alt=""
            className="auth-scene-img"
            width={440}
            height={300}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="auth-panel-stats auth-anim" data-delay="420" id="auth-panel-stats">
          <div>
            <div className="auth-stat-label">
              <Bi en="Districts active" or="ସକ୍ରିୟ ଜିଲ୍ଲା" />
            </div>
            <div className="auth-stat-val" id="auth-stat-districts" data-count-end={stats.active_district_count}>
              {stats.active_district_count}
            </div>
            <div className="auth-stat-foot">
              <Bi en="of" or="ର" /> {stats.district_count} <Bi en="in Odisha" or="ଓଡ଼ିଶାରେ" />
            </div>
          </div>
          <div>
            <div className="auth-stat-label">
              <Bi en="Median reply" or="ମଧ୍ୟ ପ୍ରତିକ୍ରିୟା" />
            </div>
            <div className="auth-stat-val" id="auth-stat-median" data-count-text={stats.median_reply}>
              {stats.median_reply}
            </div>
          </div>
          <div>
            <div className="auth-stat-label">
              <Bi en="Resolved" or="ସମାଧାନ" />
            </div>
            <div className="auth-stat-val" id="auth-stat-resolved" data-count-end={stats.closed_count}>
              {stats.closed_count}
            </div>
            <div className="auth-stat-foot">
              {stats.resolution_rate_pct}% <Bi en="rate" or="ହାର" />
            </div>
          </div>
        </div>
      </div>

      <div className="auth-panel-footer auth-anim" data-delay="520">
        <span className="auth-status-dot" />
        <Bi en="Bhubaneswar" or="ଭୁବନେଶ୍ୱର" /> · v{appVersion} · <Bi en="operational" or="ସଚଳ" />
      </div>
    </aside>
  );
}
