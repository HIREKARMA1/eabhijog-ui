import { AuthPanel } from "@/components/auth/AuthPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { LegacyScripts } from "@/components/legacy/LegacyScripts";
import { LegacyStyles } from "@/components/legacy/LegacyStyles";
import { portalStatsToDisplay } from "@/lib/portal/stats";
import { getPublicPortal } from "@/lib/api/server-portal";

export default async function LoginPage() {
  let stats = portalStatsToDisplay(null);
  let appVersion = "2.0.0";

  try {
    const portal = await getPublicPortal();
    stats = portalStatsToDisplay(portal);
    appVersion = portal.app_version;
  } catch {
    // use fallback stats
  }

  return (
    <div className="auth-body">
      <LegacyStyles sheets={["auth.css", "lang-toggle.css"]} />
      <div className="auth-page">
        <AuthPanel stats={stats} appVersion={appVersion} />
        <LoginForm stats={stats} />
      </div>
      <LegacyScripts scripts={["lang-toggle.js", "auth.js"]} />
    </div>
  );
}
