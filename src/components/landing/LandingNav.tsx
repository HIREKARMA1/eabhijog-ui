"use client";

import Link from "next/link";

import { LangSwitcher } from "@/components/i18n/LangSwitcher";
import { LinkButton } from "@/components/ui/LinkButton";
import { useI18n } from "@/lib/i18n/context";

export function LandingNav({ whatsappUrl }: { whatsappUrl: string }) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-white/95 backdrop-blur-md">
      <div className="h-[3px] bg-gradient-to-r from-red-600 via-saffron to-teal-600" />
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3 no-underline">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy-700 to-landing-blue text-sm font-bold text-white">
            OD
          </span>
          <span>
            <span className="block text-base font-bold text-slate-900">
              {t("common", "brand.name")}
            </span>
            <span className="block text-[0.65rem] uppercase tracking-[0.12em] text-text-muted">
              {t("common", "brand.govt")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <a href="#departments" className="hover:text-navy-700">
            {t("landing", "nav.departments")}
          </a>
          <Link href="/login" className="hover:text-navy-700">
            {t("landing", "nav.dashboard")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitcher />
          <LinkButton href="/login" variant="ghost" className="hidden sm:inline-flex">
            {t("common", "actions.login")}
          </LinkButton>
          <LinkButton href={whatsappUrl} variant="primary" external>
            {t("landing", "nav.fileGrievance")}
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
