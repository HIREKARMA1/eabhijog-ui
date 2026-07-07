"use client";

import { FormEvent, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError } from "@/lib/api/client";
import { updateProfile } from "@/lib/api/portal";
import { useI18n } from "@/lib/i18n/context";
import type { StaffAccount } from "@/types/api";
import { cn } from "@/lib/utils/cn";

type ProfilePanelProps = {
  initialAccount: StaffAccount;
  isOsd: boolean;
};

type Flash = { type: "success" | "error"; message: string } | null;

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-900">{children}</dd>
    </div>
  );
}

function displayValue(value: string, emptyLabel: string): ReactNode {
  const trimmed = value?.trim();
  return trimmed ? trimmed : <span className="font-normal text-text-muted">{emptyLabel}</span>;
}

export function ProfilePanel({ initialAccount, isOsd }: ProfilePanelProps) {
  const { t } = useI18n();
  const [account, setAccount] = useState(initialAccount);
  const [draft, setDraft] = useState(initialAccount);
  const [isEditing, setIsEditing] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [passwordFlash, setPasswordFlash] = useState<Flash>(null);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function startEditing() {
    setDraft(account);
    setFlash(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(account);
    setFlash(null);
    setIsEditing(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFlash(null);
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: draft.name,
        designation: draft.designation,
        district: draft.district,
        email: draft.email,
        phone: draft.phone,
      };

      if (isOsd) {
        payload.whatsapp_enabled = draft.whatsapp_enabled;
      }

      const res = await updateProfile(payload);
      setAccount(res.data);
      setDraft(res.data);
      setIsEditing(false);
      setFlash({ type: "success", message: t("auth", "profile.success") });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("auth", "profile.error");
      setFlash({ type: "error", message });
    } finally {
      setSaving(false);
    }
  }

  async function onPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordFlash(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFlash({ type: "error", message: t("auth", "profile.error") });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFlash({ type: "error", message: t("auth", "profile.passwordMismatch") });
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFlash({ type: "success", message: t("auth", "profile.passwordSuccess") });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("auth", "profile.error");
      setPasswordFlash({ type: "error", message });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {flash ? (
        <div
          role={flash.type === "error" ? "alert" : "status"}
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            flash.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          )}
        >
          {flash.message}
        </div>
      ) : null}

      {isEditing ? (
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-white p-5 shadow-sm ring-1 ring-black/[0.02] md:border-l-[3px] md:border-l-blue-600"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-navy-700">
            {t("auth", "profile.contactDetails")}
          </h2>

          <div className="mt-4 space-y-4">
            <Input
              label={t("auth", "profile.fullName")}
              name="name"
              value={draft.name}
              required
              minLength={2}
              maxLength={200}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("auth", "profile.designation")}
                name="designation"
                value={draft.designation}
                maxLength={100}
                onChange={(e) => setDraft({ ...draft, designation: e.target.value })}
              />
              <Input
                label={t("auth", "profile.district")}
                name="district"
                value={draft.district}
                maxLength={100}
                onChange={(e) => setDraft({ ...draft, district: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("auth", "profile.email")}
                name="email"
                type="email"
                value={draft.email}
                required
                maxLength={255}
                autoComplete="email"
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
              <Input
                label={t("auth", "profile.phone")}
                name="phone"
                type="tel"
                value={draft.phone}
                maxLength={20}
                autoComplete="tel"
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </div>

            {isOsd ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0 accent-saffron"
                  checked={draft.whatsapp_enabled}
                  onChange={(e) => setDraft({ ...draft, whatsapp_enabled: e.target.checked })}
                />
                <span>{t("auth", "profile.whatsappAlerts")}</span>
              </label>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={cancelEditing} disabled={saving}>
              {t("auth", "profile.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "…" : t("auth", "profile.save")}
            </Button>
          </div>
        </form>
      ) : (
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm ring-1 ring-black/[0.02] md:border-l-[3px] md:border-l-purple-600">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-navy-700">
              {t("auth", "profile.summary")}
            </h2>
            <Button type="button" size="sm" onClick={startEditing}>
              {t("auth", "profile.editProfile")}
            </Button>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <MetaItem label={t("auth", "profile.fullName")}>
              {displayValue(account.name, t("auth", "profile.notProvided"))}
            </MetaItem>
            <MetaItem label={t("auth", "profile.designation")}>
              {displayValue(account.designation, t("auth", "profile.notProvided"))}
            </MetaItem>
            <MetaItem label={t("auth", "profile.district")}>
              {displayValue(account.district, t("auth", "profile.notProvided"))}
            </MetaItem>
            <MetaItem label={t("auth", "profile.email")}>
              {account.email ? (
                <a href={`mailto:${account.email}`} className="text-link hover:underline">
                  {account.email}
                </a>
              ) : (
                displayValue("", t("auth", "profile.notProvided"))
              )}
            </MetaItem>
            <MetaItem label={t("auth", "profile.phone")}>
              {account.phone ? (
                <a href={`tel:${account.phone}`} className="text-link hover:underline">
                  {account.phone}
                </a>
              ) : (
                displayValue("", t("auth", "profile.notProvided"))
              )}
            </MetaItem>
            {isOsd ? (
              <MetaItem label={t("auth", "profile.whatsappStatus")}>
                <span
                  className={cn(
                    "inline-block rounded-full px-2 py-0.5 text-[11px] font-bold",
                    account.whatsapp_enabled
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  {account.whatsapp_enabled
                    ? t("auth", "profile.whatsappOn")
                    : t("auth", "profile.whatsappOff")}
                </span>
              </MetaItem>
            ) : null}
          </dl>
        </section>
      )}

      <form
        onSubmit={onPasswordSubmit}
        className="rounded-2xl border border-border bg-white p-5 shadow-sm ring-1 ring-black/[0.02] md:border-l-[3px] md:border-l-emerald-600"
      >
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-navy-700">
          {t("auth", "profile.changePassword")}
        </h2>
        <p className="mt-1 text-xs text-text-muted">{t("auth", "profile.passwordHint")}</p>

        {passwordFlash ? (
          <div
            role={passwordFlash.type === "error" ? "alert" : "status"}
            className={cn(
              "mt-4 rounded-lg border px-4 py-3 text-sm",
              passwordFlash.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800",
            )}
          >
            {passwordFlash.message}
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          <PasswordInput
            label={t("auth", "profile.currentPassword")}
            name="current_password"
            value={currentPassword}
            required
            autoComplete="current-password"
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordInput
              label={t("auth", "profile.newPassword")}
              name="new_password"
              value={newPassword}
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordInput
              label={t("auth", "profile.confirmPassword")}
              name="confirm_password"
              value={confirmPassword}
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? "…" : t("auth", "profile.savePassword")}
          </Button>
        </div>
      </form>
    </div>
  );
}
