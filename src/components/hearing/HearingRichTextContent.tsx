"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";
import {
  looksLikeHtml,
  plainTextFromHearingHtml,
  sanitizeHearingHtml,
} from "@/lib/hearing/richText";

type Props = {
  html: string;
  className?: string;
};

export function HearingRichTextContent({ html, className }: Props) {
  const raw = (html || "").trim();
  const [safeHtml, setSafeHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!raw || !looksLikeHtml(raw)) {
      setSafeHtml(null);
      return;
    }
    setSafeHtml(sanitizeHearingHtml(raw));
  }, [raw]);

  if (!raw) return null;

  if (!looksLikeHtml(raw) || safeHtml === null) {
    return (
      <div className={cn("whitespace-pre-wrap text-sm leading-relaxed text-slate-700", className)}>
        {plainTextFromHearingHtml(raw) || raw}
      </div>
    );
  }

  if (!plainTextFromHearingHtml(safeHtml)) return null;

  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-slate-700",
        "[&_a]:font-medium [&_a]:text-link [&_a]:underline",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_li]:my-1 [&_p]:my-1.5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
