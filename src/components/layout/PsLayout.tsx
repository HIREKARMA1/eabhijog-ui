import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { LegacyStyles } from "@/components/legacy/LegacyStyles";
import { buildPsNav } from "@/lib/navigation/build-nav";
import { getCurrentUser } from "@/lib/api/server-portal";
import { homePathFor, isPrivateSecretary } from "@/lib/auth/roles";

export async function PsLayout({
  children,
  breadcrumb,
  bodyClass = "ps-dashboard-page",
}: {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
  bodyClass?: string;
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

  const nav = buildPsNav();

  return (
    <>
      <LegacyStyles sheets={["app.css", "lang-toggle.css"]} />
      <AppShell staff={staff} homeHref="/ps/dashboard" nav={nav} breadcrumb={breadcrumb} bodyClass={bodyClass}>
        {children}
      </AppShell>
    </>
  );
}
