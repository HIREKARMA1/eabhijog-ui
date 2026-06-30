export const LOCALES = ["en", "hi", "or"] as const;

export type Locale = (typeof LOCALES)[number];

export type ContentNamespace =
  | "common"
  | "landing"
  | "auth"
  | "dashboard";

export type ContentValue = string | { [key: string]: ContentValue };

export type ContentTree = { [key: string]: ContentValue };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
