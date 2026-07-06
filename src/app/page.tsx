import { LegacyScripts } from "@/components/legacy/LegacyScripts";
import { LegacyStyles } from "@/components/legacy/LegacyStyles";
import { LandingPage } from "@/components/landing/LandingPage";
import { portalStatsToDisplay } from "@/lib/portal/stats";
import { getPublicPortal } from "@/lib/api/server-portal";

export default async function HomePage() {
  const portal = await getPublicPortal();
  const stats = portalStatsToDisplay(portal);

  return (
    <div
      className="landing-body"
      data-title-en="Jana Samadhan — Government of Odisha"
      data-title-or="ଜନ ସମାଧାନ — ଓଡ଼ିଶା ସରକାର"
    >
      <LegacyStyles sheets={["landing.css", "lang-toggle.css"]} />
      <LandingPage
        whatsappUrl={portal.whatsapp_url}
        appVersion={portal.app_version}
        departments={portal.departments}
        recentGrievances={portal.recent_grievances}
        stats={stats}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: 'window.__PORTAL_API__="/backend/api/public/portal";',
        }}
      />
      <LegacyScripts scripts={["lang-toggle.js", "landing.js"]} />
    </div>
  );
}
