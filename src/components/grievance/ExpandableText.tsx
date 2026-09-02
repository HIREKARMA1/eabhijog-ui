"use client";

import { useId, useMemo, useState } from "react";

import { useI18n } from "@/lib/i18n/context";

const DEFAULT_COLLAPSE_CHAR_THRESHOLD = 280;

type ExpandableTextProps = {
  text: string;
  maxCollapsedLines?: number;
  className?: string;
};

export function ExpandableText({
  text,
  maxCollapsedLines = 4,
  className,
}: ExpandableTextProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  const trimmed = text.trim();
  const isLong = useMemo(
    () => trimmed.length > DEFAULT_COLLAPSE_CHAR_THRESHOLD || trimmed.split("\n").length > maxCollapsedLines,
    [trimmed, maxCollapsedLines],
  );

  if (!trimmed) {
    return <span className={className}>-</span>;
  }

  return (
    <div className={className}>
      <p
        id={contentId}
        className="whitespace-pre-wrap wrap-break-word text-slate-900"
        style={
          !expanded && isLong
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxCollapsedLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {trimmed}
      </p>
      {isLong ? (
        <button
          type="button"
          className="mt-2 text-sm font-medium text-brand hover:underline"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? t("ps", "filters.showLess") : t("ps", "filters.showMore")}
        </button>
      ) : null}
    </div>
  );
}
