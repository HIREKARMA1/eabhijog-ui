"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { LoginCard } from "@/components/auth/LoginCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { login } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";

export function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(username, password);
      router.replace(result.data.redirect_path);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? t("auth", "login.invalidCredentials")
          : t("common", "errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <LoginCard>
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900">{t("auth", "login.title")}</h2>
          <p className="mt-1 text-sm text-text-muted">{t("auth", "login.subtitle")}</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            name="username"
            id="username"
            label={t("auth", "login.username")}
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              {t("auth", "login.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {t("auth", "login.submit")}
          </Button>
        </form>
      </LoginCard>
    </AuthPageLayout>
  );
}
