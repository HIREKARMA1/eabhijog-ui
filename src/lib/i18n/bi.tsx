"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n/context";

/**
 * Locale-aware bilingual/trilingual text.
 * Prefers `hi` when locale is Hindi; otherwise EN / OR.
 */
export function Bi({
  en,
  or,
  hi,
  block,
}: {
  en: ReactNode;
  or: ReactNode;
  hi?: ReactNode;
  block?: boolean;
}) {
  const { locale } = useI18n();
  const content = locale === "or" ? or : locale === "hi" && hi != null ? hi : en;

  if (block) {
    return (
      <span className="block" lang={locale === "en" ? undefined : locale}>
        {content}
      </span>
    );
  }
  return <>{content}</>;
}
