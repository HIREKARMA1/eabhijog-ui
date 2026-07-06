"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { env } from "@/config/env";
import { translate } from "@/lib/i18n/get-content";
import type { ContentNamespace, Locale } from "@/lib/i18n/types";
import { isLocale, LOCALES } from "@/lib/i18n/types";

const STORAGE_KEY = "abhijog-ui-lang";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (namespace: ContentNamespace, key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return env.defaultLocale;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;
  return env.defaultLocale;
}

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(env.defaultLocale);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    applyDocumentLocale(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyDocumentLocale(next);
    window.dispatchEvent(new CustomEvent("ui-lang-change", { detail: { lang: next } }));
  }, []);

  const t = useCallback(
    (namespace: ContentNamespace, key: string, params?: Record<string, string | number>) =>
      translate(locale, namespace, key, params),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { LOCALES };
