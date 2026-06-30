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
  t: (namespace: ContentNamespace, key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return env.defaultLocale;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;
  return env.defaultLocale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(env.defaultLocale);

  useEffect(() => {
    function applyFromStorage() {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === "or" || saved === "en") {
          setLocaleState(saved);
        }
      } catch {
        /* ignore */
      }
    }

    applyFromStorage();

    function onLangChange(event: Event) {
      const detail = (event as CustomEvent<{ lang: string }>).detail;
      if (detail?.lang === "or" || detail?.lang === "en") {
        setLocaleState(detail.lang);
      }
    }

    window.addEventListener("ui-lang-change", onLangChange);
    return () => window.removeEventListener("ui-lang-change", onLangChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.body.classList.toggle("ui-lang-or", locale === "or");
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    const isOr = next === "or";
    document.body.classList.toggle("ui-lang-or", isOr);
    document.documentElement.lang = isOr ? "or" : next === "hi" ? "hi" : "en";
    document.dispatchEvent(new CustomEvent("ui-lang-change", { detail: { lang: next } }));
  }, []);

  const t = useCallback(
    (namespace: ContentNamespace, key: string) => translate(locale, namespace, key),
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
