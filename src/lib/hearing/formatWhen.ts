import type { Locale } from "@/lib/i18n/types";

export function hearingDateLocale(locale: Locale): string {
  if (locale === "hi") return "hi-IN";
  if (locale === "or") return "or-IN";
  return "en-IN";
}

export function formatHearingWhen(iso: string, locale: Locale) {
  try {
    return new Date(iso).toLocaleString(hearingDateLocale(locale), {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
