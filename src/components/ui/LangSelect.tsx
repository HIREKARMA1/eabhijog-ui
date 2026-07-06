"use client";

import { useI18n } from "@/lib/i18n/context";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/cn";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  hi: "हि",
  or: "ଓଡ଼",
};

export function LangSelect({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const { locale, setLocale, t } = useI18n();
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border p-0.5",
        isDark ? "border-neutral-600 bg-neutral-800" : "border-border bg-white",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
            locale === code
              ? isDark
                ? "bg-white text-neutral-900"
                : "bg-navy-700 text-white"
              : isDark
                ? "text-neutral-200 hover:bg-neutral-700"
                : "text-slate-600 hover:bg-surface-muted",
          )}
          aria-pressed={locale === code}
          lang={code}
          title={t("common", `lang.${code}`)}
          onClick={() => setLocale(code)}
        >
          {localeLabels[code]}
        </button>
      ))}
    </div>
  );
}
