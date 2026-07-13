import { redirect } from "next/navigation";

import { PortalShell } from "@/components/shell/PortalShell";
import { buildNavForIntelligencePage } from "@/lib/navigation/build-nav";
import { getCurrentUser } from "@/lib/api/server-portal";
import {
  canAccessIntelligence,
  canManageIntelligence,
  homePathFor,
} from "@/lib/auth/roles";

export async function IntelligenceLayout({
  children,
  breadcrumb,
}: {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  let staff;
  try {
    staff = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  if (!canAccessIntelligence(staff)) {
    redirect(homePathFor(staff));
  }

  const readOnly = !canManageIntelligence(staff);

  return (
    <PortalShell
      staff={staff}
      homeHref={homePathFor(staff)}
      nav={buildNavForIntelligencePage(staff)}
      breadcrumb={breadcrumb}
    >
      <div data-intelligence-readonly={readOnly ? "true" : undefined}>{children}</div>
    </PortalShell>
  );
}
