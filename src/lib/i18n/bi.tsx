"use client";

import type { ReactNode } from "react";

/** Bilingual text matching original Jinja `bi()` macro — uses .i18n-en / .i18n-or CSS. */
export function Bi({
  en,
  or,
  block,
}: {
  en: ReactNode;
  or: ReactNode;
  block?: boolean;
}) {
  if (block) {
    return (
      <>
        <span className="i18n-en">{en}</span>
        <span className="i18n-or i18n-block" lang="or">
          {or}
        </span>
      </>
    );
  }
  return (
    <>
      <span className="i18n-en">{en}</span>
      <span className="i18n-or" lang="or">
        {or}
      </span>
    </>
  );
}
