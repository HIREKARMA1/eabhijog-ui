"use client";



import type { ReactNode } from "react";



import { GovtNavbar } from "@/components/shell/GovtNavbar";

import { useI18n } from "@/lib/i18n/context";



type AuthPageLayoutProps = {

  children: ReactNode;

};



export function AuthPageLayout({ children }: AuthPageLayoutProps) {

  const { t } = useI18n();



  return (

    <div className="auth-page-bg flex min-h-screen flex-col">

      <GovtNavbar homeHref="/" />



      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-12">

        <section className="w-full max-w-lg lg:flex-1">

          <p className="text-xs font-semibold uppercase tracking-wider text-saffron">

            {t("auth", "login.heroLabel")}

          </p>

          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">

            {t("auth", "login.heroTitle")}

          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted">

            {t("auth", "login.heroSubtitle")}

          </p>

          <div className="mt-6 flex gap-1">

            <span className="h-1 w-8 rounded-full bg-saffron" />

            <span className="h-1 w-8 rounded-full bg-saffron-hover" />

            <span className="h-1 w-8 rounded-full bg-orange-300" />

          </div>

        </section>



        <div className="w-full max-w-md shrink-0 px-3 sm:px-4 lg:flex-1 lg:flex lg:justify-end lg:px-0">
          {children}
        </div>

      </main>

    </div>

  );

}


