"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { PortalShell } from "@/components/shell/PortalShell";
import { PageLoader } from "@/components/ui/Spinner";
import { fetchCurrentUser, fetchProfile } from "@/lib/api/portal";
import { homePathFor, isOsdRole, isPortalAdmin, isPrivateSecretary, formatStaffRole } from "@/lib/auth/roles";
import { useI18n } from "@/lib/i18n/context";
import { buildNavForStaff } from "@/lib/navigation/build-nav";
import type { AuthStaff, StaffAccount } from "@/types/api";

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [staff, setStaff] = useState<AuthStaff | null>(null);
  const [account, setAccount] = useState<StaffAccount | null>(null);

  useEffect(() => {
    Promise.all([fetchCurrentUser(), fetchProfile()])
      .then(([me, profile]) => {
        setStaff(me.data);
        setAccount(profile.data);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!staff || !account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <PageLoader />
      </div>
    );
  }

  const homeHref = homePathFor(staff);
  const nav = buildNavForStaff(staff);
  const dashboardLabel = isPrivateSecretary(staff)
    ? t("ps", "title")
    : isPortalAdmin(staff)
      ? t("dashboard", "nav.dashboard")
      : (staff.osd_category ?? formatStaffRole(staff.role));

  return (
    <PortalShell
      staff={staff}
      homeHref={homeHref}
      nav={nav}
      breadcrumb={
        <>
          <Link href={homeHref} className="hover:text-slate-900 hover:underline">
            {dashboardLabel}
          </Link>
          {" > "}
          <strong className="text-slate-900">{t("common", "actions.profile")}</strong>
        </>
      }
    >
      <ProfilePanel
        key={account.id}
        initialAccount={account}
        isOsd={isOsdRole(account.role)}
      />
    </PortalShell>
  );
}
