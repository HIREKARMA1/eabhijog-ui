"use client";

import { HearingRichTextEditor } from "@/components/hearing/HearingRichTextEditor";
import { defaultHearingTitle } from "@/lib/hearing/eventDefaults";
import { toEditorHtml } from "@/lib/hearing/richText";
import { cn } from "@/lib/utils/cn";
import type { HearingLocaleContent } from "@/types/api";

export type HearingContentLocale = "en" | "hi" | "or";

export type HearingLocaleBundle = Record<HearingContentLocale, HearingLocaleContent>;

export const EMPTY_LOCALE_CONTENT: HearingLocaleContent = {
  title: "",
  description: "",
  what_to_expect: "",
  important_notes: "",
};

export function emptyLocaleBundle(): HearingLocaleBundle {
  return {
    en: { ...EMPTY_LOCALE_CONTENT },
    hi: { ...EMPTY_LOCALE_CONTENT },
    or: { ...EMPTY_LOCALE_CONTENT },
  };
}

export function bundleFromHearing(hearing: {
  title: string;
  description?: string;
  what_to_expect?: string;
  important_notes?: string;
  content_i18n?: Record<string, HearingLocaleContent>;
}): HearingLocaleBundle {
  const i18n = hearing.content_i18n || {};
  return {
    en: {
      title: hearing.title || "",
      description: hearing.description || "",
      what_to_expect: hearing.what_to_expect || "",
      important_notes: hearing.important_notes || "",
    },
    hi: { ...EMPTY_LOCALE_CONTENT, ...i18n.hi },
    or: { ...EMPTY_LOCALE_CONTENT, ...i18n.or },
  };
}

/** Build API payload: English columns + optional hi/or content_i18n. */
export function buildContentI18nPayload(bundle: HearingLocaleBundle) {
  const content_i18n: Record<string, HearingLocaleContent> = {};
  for (const locale of ["hi", "or"] as const) {
    const block = bundle[locale];
    const cleaned: HearingLocaleContent = {
      title: (block.title || "").trim() || defaultHearingTitle(locale),
      description: block.description || "",
      what_to_expect: block.what_to_expect || "",
      important_notes: block.important_notes || "",
    };
    if (
      cleaned.title ||
      cleaned.description ||
      cleaned.what_to_expect ||
      cleaned.important_notes
    ) {
      content_i18n[locale] = cleaned;
    }
  }
  return {
    title: (bundle.en.title || "").trim() || defaultHearingTitle("en"),
    description: bundle.en.description || "",
    what_to_expect: bundle.en.what_to_expect || "",
    important_notes: bundle.en.important_notes || "",
    content_i18n,
  };
}

const TAB_LABELS: { id: HearingContentLocale; label: string; hint?: string }[] = [
  { id: "en", label: "English", hint: "Required" },
  { id: "or", label: "Odia", hint: "Optional" },
  { id: "hi", label: "Hindi", hint: "Optional" },
];

export function HearingLocaleTabBar({
  value,
  onChange,
}: {
  value: HearingContentLocale;
  onChange: (locale: HearingContentLocale) => void;
}) {
  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-surface-muted/60 p-1 sm:col-span-2"
      role="tablist"
      aria-label="Hearing content language"
    >
      {TAB_LABELS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "min-h-11 rounded-lg px-2 text-sm font-semibold transition-colors",
              active
                ? "bg-navy-700 text-white shadow-sm"
                : "text-slate-700 hover:bg-white",
            )}
          >
            <span className="block">{tab.label}</span>
            {tab.hint ? (
              <span className={cn("block text-[10px] font-medium", active ? "text-white/75" : "text-slate-500")}>
                {tab.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type FieldsProps = {
  locale: HearingContentLocale;
  values: HearingLocaleContent;
  onChange: (next: HearingLocaleContent) => void;
  expectDefault?: string;
  notesDefault?: string;
  className?: string;
};

export function HearingLocalizedContentFields({
  locale,
  values,
  onChange,
  expectDefault = "",
  notesDefault = "",
  className,
}: FieldsProps) {
  const required = locale === "en";
  const optionalHint =
    locale === "en" ? undefined : "Optional — falls back to English on the public portal.";

  function patch(partial: Partial<HearingLocaleContent>) {
    onChange({ ...values, ...partial });
  }

  const titleDefault = defaultHearingTitle(locale);
  const titleValue = values.title?.trim() ? values.title : titleDefault;

  const expectValue =
    values.what_to_expect && values.what_to_expect.trim()
      ? values.what_to_expect
      : locale === "en"
        ? expectDefault
        : values.what_to_expect || "";
  const notesValue =
    values.important_notes && values.important_notes.trim()
      ? values.important_notes
      : locale === "en"
        ? notesDefault
        : values.important_notes || "";

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2 sm:col-span-2", className)}>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">
          Title {required ? <span className="text-red-600">*</span> : null}
        </span>
        <input
          value={titleValue}
          required={required}
          onChange={(e) => patch({ title: e.target.value })}
          onFocus={() => {
            if (!(values.title || "").trim()) {
              patch({ title: titleDefault });
            }
          }}
          placeholder={optionalHint}
          className="w-full rounded-xl border bg-white px-3 py-2.5 min-h-11"
        />
      </label>
      <HearingRichTextEditor
        key={`${locale}-description`}
        className="sm:col-span-2"
        name={`description_${locale}`}
        label="Description"
        hint={optionalHint}
        defaultValue={toEditorHtml(values.description || "")}
        minHeightClassName="min-h-24"
        onHtmlChange={(html) => patch({ description: html })}
      />
      <HearingRichTextEditor
        key={`${locale}-expect`}
        className="sm:col-span-2"
        name={`what_to_expect_${locale}`}
        label="What to expect"
        hint={optionalHint}
        defaultValue={toEditorHtml(expectValue)}
        minHeightClassName="min-h-40"
        onHtmlChange={(html) => patch({ what_to_expect: html })}
      />
      <HearingRichTextEditor
        key={`${locale}-notes`}
        className="sm:col-span-2"
        name={`important_notes_${locale}`}
        label="Important notes"
        hint={optionalHint}
        defaultValue={toEditorHtml(notesValue)}
        minHeightClassName="min-h-36"
        onHtmlChange={(html) => patch({ important_notes: html })}
      />
    </div>
  );
}
