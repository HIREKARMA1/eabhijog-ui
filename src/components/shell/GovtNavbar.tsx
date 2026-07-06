"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/icons/Icon";
import { LangSelect } from "@/components/ui/LangSelect";
import { useI18n } from "@/lib/i18n/context";
import { assets } from "@/theme";
import { cn } from "@/lib/utils/cn";

type GovtNavbarProps = {
  homeHref?: string;
  onMenuClick?: () => void;
};

export function GovtNavbar({ homeHref = "/", onMenuClick }: GovtNavbarProps) {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleMobileToggle() {
    if (onMenuClick) {
      onMenuClick();
      return;
    }
    setMobileOpen((open) => !open);
  }

  const mobileLabel = onMenuClick
    ? t("common", "nav.menu")
    : mobileOpen
      ? t("common", "nav.close")
      : t("common", "nav.menu");

  return (
    <header className="sticky top-0 z-40 shrink-0 overflow-hidden shadow-lg">
      <div className="flex h-8 items-center justify-between bg-neutral-800 px-3 text-[11px] text-neutral-100 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-medium tracking-wide">{t("common", "navbar.govTitle")}</span>
          <span className="hidden truncate text-neutral-300 sm:inline">
            {t("common", "navbar.govSubtitle")}
          </span>
        </div>
        <LangSelect tone="dark" />
      </div>

      <div className="overflow-hidden bg-saffron">
        <div className="mx-auto flex h-20 max-w-[1920px] items-center justify-between gap-2 px-3 sm:h-24 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href={homeHref}
            className="flex min-w-0 shrink items-center gap-2 text-white no-underline transition-opacity hover:opacity-90 sm:gap-4"
          >
            <div className="relative h-14 w-14 shrink-0 sm:h-20 sm:w-20">
              <Image
                src={assets.logoOdisha}
                alt={t("common", "navbar.logoAlt")}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 56px, 80px"
                priority
              />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-lg font-extrabold tracking-tight text-white sm:text-2xl">
                {t("common", "brand.name")}
              </span>
              <span className="hidden truncate text-sm font-semibold text-orange-100 sm:block sm:text-base">
                {t("common", "navbar.tagline")}
              </span>
            </div>
          </Link>

          <div className="flex min-w-0 shrink items-center gap-2 sm:gap-4">
            <div className="hidden min-w-0 shrink items-center gap-2 px-2 py-1.5 md:flex md:gap-4 md:px-4 md:py-2">
              <div className="min-w-0 shrink text-right">
                <p className="truncate text-base font-extrabold leading-tight text-white sm:text-xl">
                  {t("common", "navbar.ministerName")}
                </p>
                <p className="truncate text-sm font-semibold leading-tight text-orange-100 sm:text-base">
                  {t("common", "navbar.ministerSubtitle")}
                </p>
              </div>
              <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-sm sm:h-20 sm:w-16 md:h-24 md:w-20">
                <Image
                  src={assets.ministerPortrait}
                  alt={t("common", "navbar.ministerAlt")}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 44px, 80px"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleMobileToggle}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 md:hidden"
              aria-label={mobileLabel}
              aria-expanded={onMenuClick ? undefined : mobileOpen}
            >
              {onMenuClick ? (
                <Icon name="menu" size={22} />
              ) : (
                <span className="flex h-6 w-6 flex-col justify-center gap-1">
                  <span
                    className={cn(
                      "block h-0.5 w-5 rounded-full bg-white transition-all",
                      mobileOpen && "translate-y-1.5 rotate-45",
                    )}
                  />
                  <span
                    className={cn(
                      "block h-0.5 w-5 rounded-full bg-white transition-all",
                      mobileOpen && "opacity-0",
                    )}
                  />
                  <span
                    className={cn(
                      "block h-0.5 w-5 rounded-full bg-white transition-all",
                      mobileOpen && "-translate-y-1.5 -rotate-45",
                    )}
                  />
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && !onMenuClick ? (
          <div className="border-t border-white/10 md:hidden">
            <div className="mx-auto flex min-h-[88px] max-w-[1920px] items-center gap-4 px-3 py-4 sm:px-6">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md sm:h-24 sm:w-20">
                <Image
                  src={assets.ministerPortrait}
                  alt=""
                  fill
                  className="object-cover object-top"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold leading-tight text-white sm:text-lg">
                  {t("common", "navbar.ministerName")}
                </p>
                <p className="truncate text-sm font-semibold leading-tight text-orange-100 sm:text-base">
                  {t("common", "navbar.ministerSubtitle")}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
