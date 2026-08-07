"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n/context";
import { assets, externalLinks } from "@/theme";
import { cn } from "@/lib/utils/cn";

type PortalFooterProps = {
  whatsappUrl?: string;
  className?: string;
};

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition hover:border-saffron/50 hover:bg-saffron/15 hover:text-white"
    >
      {children}
    </a>
  );
}

export function PortalFooter({ whatsappUrl, className }: PortalFooterProps) {
  const { t } = useI18n();
  const waHref = whatsappUrl?.trim() || externalLinks.whatsappGrievance;

  return (
    <footer className={cn("mt-auto border-t border-border bg-navy-950 text-slate-300", className)}>
      <div className="mx-auto max-w-[1920px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src={assets.logoOdisha}
                alt={t("common", "navbar.logoAlt")}
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <div>
              <p className="text-base font-extrabold text-white">{t("common", "brand.name")}</p>
              <p className="text-sm text-slate-400">{t("common", "brand.govt")}</p>
              <p className="mt-1 text-xs text-slate-500">{t("common", "navbar.tagline")}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-10 sm:gap-14">
            <div>
              <p className="font-bold text-white">{t("common", "footer.forCitizens")}</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-saffron"
                  >
                    {t("common", "footer.fileWhatsapp")}
                  </a>
                </li>
                <li>
                  <Link href="/hearing" className="hover:text-saffron">
                    {t("common", "footer.hearing")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white">{t("common", "footer.followMinister")}</p>
              <div className="mt-3 flex items-center gap-2">
                <SocialIcon href={externalLinks.ministerInstagram} label={t("common", "footer.instagram")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={externalLinks.ministerFacebook} label={t("common", "footer.facebook")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={externalLinks.ministerTwitter} label={t("common", "footer.twitter")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.889L2.25 2.25h6.093l4.263 5.697L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                </SocialIcon>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs leading-relaxed text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="min-w-0">{t("common", "footer.copyright")}</p>
          <p className="shrink-0 sm:text-right">
            {t("common", "footer.poweredByPrefix")}{" "}
            <a
              href={externalLinks.hirekarma}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-300 underline-offset-2 hover:text-saffron hover:underline"
            >
              {t("common", "footer.poweredByName")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
