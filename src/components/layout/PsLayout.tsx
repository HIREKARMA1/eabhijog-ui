import { redirect } from "next/navigation";

import { PortalShell } from "@/components/shell/PortalShell";
import { buildPsNav } from "@/lib/navigation/build-nav";
import { getCurrentUser } from "@/lib/api/server-portal";
import { homePathFor, isPrivateSecretary } from "@/lib/auth/roles";

export async function PsLayout({
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

  if (!isPrivateSecretary(staff)) {
    redirect(homePathFor(staff));
  }

  return (
    <PortalShell staff={staff} homeHref="/ps/dashboard" nav={buildPsNav()} breadcrumb={breadcrumb}>
      {children}
    </PortalShell>
  );
}
