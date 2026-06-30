"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";

import { AuthPanel } from "@/components/auth/AuthPanel";
import { LangSwitcher } from "@/components/i18n/LangSwitcher";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

type AuthFormLayoutProps = {
  titleKey: string;
  subtitleKey: string;
  children: ReactNode;
  backHref?: string;
};

export function AuthFormLayout({
  titleKey,
  subtitleKey,
  children,
  backHref = "/login",
}: AuthFormLayoutProps) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(440px,560px)_1fr]">
      <AuthPanel />
      <div className="flex flex-col justify-center px-6 py-10 lg:px-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("auth", titleKey)}</h1>
            <p className="mt-1 text-sm text-text-muted">{t("auth", subtitleKey)}</p>
          </div>
          <LangSwitcher />
        </div>
        <div className="mx-auto w-full max-w-md">{children}</div>
        <p className="mx-auto mt-6 max-w-md text-sm">
          <Link href={backHref} className="font-semibold text-navy-700 hover:underline">
            {t("auth", "forgotPassword.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}

type SimpleAuthFormProps = {
  titleKey: string;
  subtitleKey: string;
  fields: Array<{ name: string; labelKey: string; type?: string }>;
  submitKey: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  successKey?: string;
};

export function SimpleAuthForm({
  titleKey,
  subtitleKey,
  fields,
  submitKey,
  onSubmit,
  successKey,
}: SimpleAuthFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(values);
      setDone(true);
      if (successKey) setMessage(t("auth", successKey));
    } catch {
      setError(t("common", "errors.generic"));
    }
  }

  return (
    <AuthFormLayout titleKey={titleKey} subtitleKey={subtitleKey}>
      {done && message ? (
        <p className="rounded-lg bg-emerald-50 p-4 text-sm text-success">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <label key={field.name} className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">{t("auth", field.labelKey)}</span>
              <input
                type={field.type ?? "text"}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm"
                value={values[field.name] ?? ""}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                required={field.name !== "phone" && field.name !== "message"}
              />
            </label>
          ))}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full">{t("auth", submitKey)}</Button>
        </form>
      )}
    </AuthFormLayout>
  );
}
