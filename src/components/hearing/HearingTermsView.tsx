"use client";

import Link from "next/link";

import { Icon } from "@/components/icons/Icon";
import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { useI18n } from "@/lib/i18n/context";

export function HearingTermsView() {
  const { t } = useI18n();
  const H = (key: string) => t("hearing", key);

  const sections = [
    { title: H("terms.s1Title"), body: H("terms.s1Body") },
    { title: H("terms.s2Title"), body: H("terms.s2Body") },
    { title: H("terms.s3Title"), body: H("terms.s3Body") },
    { title: H("terms.s4Title"), body: H("terms.s4Body") },
    { title: H("terms.s5Title"), body: H("terms.s5Body") },
    { title: H("terms.s6Title"), body: H("terms.s6Body") },
    { title: H("terms.s7Title"), body: H("terms.s7Body") },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <Link href="/" className="font-medium text-navy-700 hover:text-saffron hover:underline">
            {t("common", "brand.name")}
          </Link>
          <Icon name="chevron-right" size={14} className="text-slate-400" />
          <Link href="/hearing" className="font-medium text-navy-700 hover:text-saffron hover:underline">
            {H("list.breadcrumb")}
          </Link>
          <Icon name="chevron-right" size={14} className="text-slate-400" />
          <span className="text-slate-600">{H("terms.breadcrumb")}</span>
        </nav>

        <h1 className="mt-6 wrap-break-word text-2xl font-bold text-slate-900 sm:text-3xl">
          {H("terms.title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{H("terms.subtitle")}</p>

        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-bold text-navy-800">{section.title}</h2>
              <p className="mt-2">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">{H("terms.closeHint")}</p>
      </main>

      <PortalFooter />
    </div>
  );
}
