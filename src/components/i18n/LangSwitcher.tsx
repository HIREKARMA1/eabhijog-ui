"use client";

import { useI18n } from "@/lib/i18n/context";

/** Matches original `_lang_toggle.html` + `lang-toggle.css`. */
export function LangSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`lang-toggle${className ? ` ${className}` : ""}`} role="group" aria-label="Display language">
      <button
        type="button"
        className={`lang-toggle-btn${locale === "en" ? " active" : ""}`}
        data-ui-lang="en"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-toggle-btn${locale === "or" ? " active" : ""}`}
        data-ui-lang="or"
        aria-pressed={locale === "or"}
        lang="or"
        onClick={() => setLocale("or")}
      >
        ଓଡ଼ିଆ
      </button>
    </div>
  );
}
