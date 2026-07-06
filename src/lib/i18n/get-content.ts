import type { ContentNamespace, ContentTree, ContentValue, Locale } from "./types";

import psEn from "@/content/en/ps.json";
import psHi from "@/content/hi/ps.json";
import psOr from "@/content/or/ps.json";
import authEn from "@/content/en/auth.json";
import authHi from "@/content/hi/auth.json";
import authOr from "@/content/or/auth.json";
import commonEn from "@/content/en/common.json";
import commonHi from "@/content/hi/common.json";
import commonOr from "@/content/or/common.json";
import dashboardEn from "@/content/en/dashboard.json";
import dashboardHi from "@/content/hi/dashboard.json";
import dashboardOr from "@/content/or/dashboard.json";
import landingEn from "@/content/en/landing.json";
import landingHi from "@/content/hi/landing.json";
import landingOr from "@/content/or/landing.json";

const bundles: Record<Locale, Record<ContentNamespace, ContentTree>> = {
  en: {
    common: commonEn,
    landing: landingEn,
    auth: authEn,
    dashboard: dashboardEn,
    ps: psEn,
  },
  hi: {
    common: commonHi,
    landing: landingHi,
    auth: authHi,
    dashboard: dashboardHi,
    ps: psHi,
  },
  or: {
    common: commonOr,
    landing: landingOr,
    auth: authOr,
    dashboard: dashboardOr,
    ps: psOr,
  },
};

export function getNamespace(locale: Locale, namespace: ContentNamespace): ContentTree {
  return bundles[locale][namespace];
}

export function resolvePath(tree: ContentTree, path: string): string | undefined {
  const parts = path.split(".");
  let node: ContentValue | undefined = tree;
  for (const part of parts) {
    if (!node || typeof node === "string") return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

export function translate(
  locale: Locale,
  namespace: ContentNamespace,
  key: string,
  params?: Record<string, string | number>,
): string {
  let value = resolvePath(getNamespace(locale, namespace), key);
  if (!value) return key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
}
