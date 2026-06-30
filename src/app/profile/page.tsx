"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fetchCurrentUser, fetchProfile, updateProfile } from "@/lib/api/portal";
import { buildPortalNav } from "@/lib/navigation/build-nav";
import { useI18n } from "@/lib/i18n/context";
import type { AuthStaff, StaffAccount } from "@/types/api";
import { homePathFor, isPortalAdmin } from "@/lib/auth/roles";

export default function ProfilePage() {
  const { t } = useI18n();
  const [staff, setStaff] = useState<AuthStaff | null>(null);
  const [account, setAccount] = useState<StaffAccount | null>(null);
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    Promise.all([fetchCurrentUser(), fetchProfile()])
      .then(([me, profile]) => {
        setStaff(me.data);
        setAccount(profile.data);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!account) return;
    const res = await updateProfile({
      name: account.name,
      designation: account.designation,
      district: account.district,
      email: account.email,
      phone: account.phone,
    });
    setAccount(res.data);
    setMessage(t("auth", "profile.success"));
  }

  if (!staff || !account) return null;

  const nav = isPortalAdmin(staff)
    ? buildPortalNav(staff, 0, {})
    : [{ href: homePathFor(staff), labelKey: "nav.dashboard" }];

  return (
    <AppShell staff={staff} homeHref={homePathFor(staff)} nav={nav} breadcrumb="Profile">
      <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-white p-5">
        <h1 className="text-xl font-bold">{t("auth", "profile.title")}</h1>
        <Input label="Name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
        <Input label="Email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
        <Input label="Designation" value={account.designation} onChange={(e) => setAccount({ ...account, designation: e.target.value })} />
        <Input label="District" value={account.district} onChange={(e) => setAccount({ ...account, district: e.target.value })} />
        {message ? <p className="text-sm text-success">{message}</p> : null}
        <Button type="submit">{t("auth", "profile.save")}</Button>
      </form>
    </AppShell>
  );
}
