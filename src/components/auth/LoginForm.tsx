"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { LangSwitcher } from "@/components/i18n/LangSwitcher";
import { Bi } from "@/lib/i18n/bi";
import { login } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { portalStatsToDisplay } from "@/lib/portal/stats";

type LoginFormProps = {
  stats?: Record<string, string>;
};

export function LoginForm({ stats = portalStatsToDisplay(null) }: LoginFormProps) {
  const router = useRouter();
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
      router.push(result.data.redirect_path);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Invalid email/username or password. Please try again."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form-side">
      <div className="auth-form-bg" aria-hidden="true">
        <div className="auth-form-light-orb auth-form-light-orb--a" />
        <div className="auth-form-light-orb auth-form-light-orb--b" />
        <div className="auth-form-light-orb auth-form-light-orb--c" />
      </div>

      <div className="auth-form-top auth-anim-right" data-delay="0">
        <LangSwitcher />
        <a href="mailto:support@abhijog.odisha.gov.in" className="auth-help-link">
          <span className="auth-help-short">
            <Bi en="Need help?" or="ସାହାଯ୍ୟ?" />
          </span>
          <span className="auth-help-full">
            <Bi en="Need help?" or="ସାହାଯ୍ୟ ଦରକାର?" /> <strong>support@abhijog.odisha.gov.in</strong>
          </span>
        </a>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-accent" aria-hidden="true" />
        <div className="auth-form-header auth-anim-right" data-delay="60">
          <div className="auth-form-trust">
            <span className="auth-trust-pill auth-trust-pill--secure">
              <Bi en="Secure portal" or="ସୁରକ୍ଷିତ ପୋର୍ଟାଲ" />
            </span>
            <span className="auth-trust-pill auth-trust-pill--live">
              <Bi en="WhatsApp live" or="WhatsApp ଲାଇଭ୍" />
            </span>
            <span className="auth-trust-pill auth-trust-pill--gov">
              <Bi en="Govt. of Odisha" or="ଓଡ଼ିଶା ସରକାର" />
            </span>
          </div>
          <div className="auth-form-label auth-anim-right" data-delay="80">
            <Bi en="Officer portal" or="ଅଧିକାରୀ ପୋର୍ଟାଲ" />
          </div>
          <h2 className="auth-form-title auth-anim-right" data-delay="140">
            <Bi en="Sign in to e-Abhijog" or="e-Abhijog ରେ ସାଇନ ଇନ" />
          </h2>
          <div className="auth-form-highlights auth-anim-right" data-delay="240" data-source="live-db" id="login-live-stats">
            <div className="auth-highlight auth-highlight--blue">
              <span className="auth-highlight-icon" aria-hidden="true">
                📱
              </span>
              <div className="auth-highlight-body">
                <span className="auth-highlight-val" data-stat="grievances_30d">
                  {stats.grievances_30d}
                </span>
                <span className="auth-highlight-label">
                  <Bi en="Last 30 days" or="ଗତ ୩୦ ଦିନ" />
                </span>
              </div>
            </div>
            <div className="auth-highlight auth-highlight--amber">
              <span className="auth-highlight-icon" aria-hidden="true">
                📋
              </span>
              <div className="auth-highlight-body">
                <span className="auth-highlight-val" data-stat="open_count">
                  {stats.preview_active}
                </span>
                <span className="auth-highlight-label">
                  <Bi en="Open now" or="ବର୍ତ୍ତମାନ ଖୋଲା" />
                </span>
              </div>
            </div>
            <div className="auth-highlight auth-highlight--green">
              <span className="auth-highlight-icon" aria-hidden="true">
                ✓
              </span>
              <div className="auth-highlight-body">
                <span className="auth-highlight-val" data-stat="resolution_rate_pct">
                  {stats.resolution_rate_pct}%
                </span>
                <span className="auth-highlight-label">
                  <span className="i18n-en">Resolved · {stats.median_reply}</span>
                  <span className="i18n-or">ସମାଧାନ · {stats.median_reply}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-body">
          {error ? <div className="auth-alert auth-alert-error auth-shake">{error}</div> : null}

          <form onSubmit={onSubmit} id="auth-login-form">
            <div className="auth-field auth-anim-right" data-delay="280">
              <label htmlFor="username" className="auth-field-label">
                <Bi en="Email or username" or="ଇମେଲ କିମ୍ବା ୟୁଜରନେମ" />
              </label>
              <input
                type="text"
                name="username"
                id="username"
                required
                autoComplete="username"
                className="auth-input"
                placeholder="superadmin or officer@odisha.gov.in"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="auth-field auth-anim-right" data-delay="340">
              <div className="auth-field-label-row">
                <label htmlFor="password" className="auth-field-label">
                  <Bi en="Password" or="ପାସୱାର୍ଡ" />
                </label>
                <Link href="/forgot-password" className="auth-field-link">
                  <Bi en="Forgot password?" or="ପାସୱାର୍ଡ ଭୁଲିଗଲେ?" />
                </Link>
              </div>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  autoComplete="current-password"
                  className="auth-input auth-input-inset"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  id="auth-toggle-password"
                  aria-label="Show password"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <svg className="auth-eye auth-eye-show" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <label className="auth-checkbox-row auth-anim-right" data-delay="400">
              <input type="checkbox" name="remember" value="1" />
              <Bi en="Keep me signed in on this device" or="ଏହି ଡିଭାଇସରେ ସାଇନ ଇନ ରଖନ୍ତୁ" />
            </label>

            <div className="auth-anim-right" data-delay="460">
              <button type="submit" className="auth-btn auth-btn-primary" id="auth-submit-btn" disabled={loading}>
                <span className="auth-btn-text">
                  <Bi en="Sign In" or="ସାଇନ ଇନ" />
                </span>
                <span className="auth-btn-spinner" aria-hidden="true" />
              </button>
            </div>
          </form>

          <p className="auth-form-footer auth-anim-right" data-delay="640">
            <Bi en="New officer?" or="ନୂଆ ଅଧିକାରୀ?" />{" "}
            <Link href="/request-access">
              <Bi en="Request access from your DM." or="ଆପଣଙ୍କ DM ଠାରୁ ଅନୁମତି ଅନୁରୋଧ କରନ୍ତୁ।" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
