"use client";

import { useI18n } from "@/lib/i18n/context";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/cn";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  hi: "हि",
  or: "ଓଡ଼",
};

export function LangSelect({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn("inline-flex rounded-lg border border-border bg-white p-0.5", className)}
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
              ? "bg-navy-700 text-white"
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
