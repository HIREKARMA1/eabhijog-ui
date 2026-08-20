import type { Locale } from "@/lib/i18n/types";
import type { HearingLocaleContent, HearingPublicSummary } from "@/types/api";

export type HearingContentFields = {
  title: string;
  description: string;
  what_to_expect: string;
  important_notes: string;
};

type HearingLike = Pick<
  HearingPublicSummary,
  "title" | "description" | "what_to_expect" | "important_notes" | "content_i18n"
>;

function pickLocaleOverride(
  contentI18n: HearingLike["content_i18n"],
  locale: Locale,
): HearingLocaleContent | undefined {
  if (!contentI18n || locale === "en") return undefined;
  return contentI18n[locale];
}

/** Resolve hearing copy for the active UI locale with English fallback. */
export function resolveHearingContent(
  hearing: HearingLike,
  locale: Locale,
): HearingContentFields {
  const override = pickLocaleOverride(hearing.content_i18n, locale);
  const title = override?.title?.trim() || hearing.title;
  const description = override?.description?.trim() || hearing.description || "";
  const what_to_expect =
    override?.what_to_expect?.trim() || hearing.what_to_expect || "";
  const important_notes =
    override?.important_notes?.trim() || hearing.important_notes || "";

  return { title, description, what_to_expect, important_notes };
}
