"use client";

import Script from "next/script";

export function LegacyScripts({ scripts }: { scripts: string[] }) {
  return (
    <>
      {scripts.map((src, index) => (
        <Script key={src} src={`/static/js/${src}`} strategy={index === 0 ? "afterInteractive" : "lazyOnload"} />
      ))}
    </>
  );
}
