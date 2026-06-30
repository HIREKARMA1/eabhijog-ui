"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AuthFormLayout } from "@/components/auth/AuthFormLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resetPassword } from "@/lib/api/portal";
import { useI18n } from "@/lib/i18n/context";
import { FormEvent, useState } from "react";

function ResetPasswordForm() {
  const { t } = useI18n();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await resetPassword(token, password, confirm);
      setDone(true);
    } catch {
      setError(t("common", "errors.generic"));
    }
  }

  if (!token) {
    return <p className="text-sm text-danger">{t("auth", "resetPassword.expired")}</p>;
  }

  return (
    <AuthFormLayout titleKey="resetPassword.title" subtitleKey="resetPassword.subtitle">
      {done ? (
        <p className="rounded-lg bg-emerald-50 p-4 text-sm text-success">
          {t("auth", "resetPassword.success")}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="password"
            label={t("auth", "resetPassword.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            label={t("auth", "resetPassword.confirm")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full">
            {t("auth", "resetPassword.submit")}
          </Button>
        </form>
      )}
    </AuthFormLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
