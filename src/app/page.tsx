import { LandingPage } from "@/components/landing/LandingPage";
import { portalStatsToDisplay } from "@/lib/portal/stats";
import { getPublicPortal } from "@/lib/api/server-portal";

export default async function HomePage() {
  let portal = null;
  try {
    portal = await getPublicPortal();
  } catch {
    portal = null;
  }
  const stats = portalStatsToDisplay(portal);

  return (
    <LandingPage
      whatsappUrl={portal?.whatsapp_url || "https://wa.me/916371912718"}
      departments={portal?.departments || []}
      recentGrievances={portal?.recent_grievances || []}
      stats={stats}
    />
  );
}
