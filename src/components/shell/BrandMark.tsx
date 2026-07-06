"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/lib/i18n/context";
import { assets } from "@/theme";

type BrandMarkProps = {
  href: string;
  compact?: boolean;
};

export function BrandMark({ href, compact = false }: BrandMarkProps) {
  const { t } = useI18n();

  return (
    <Link href={href} className="sidebar-nav-link flex items-center gap-3 no-underline">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-saffron/10">
        <Image
          src={assets.konarkWheel}
          alt=""
          width={22}
          height={22}
          className="opacity-90"
        />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="sidebar-brand-title block truncate text-sm font-semibold">
            {t("common", "brand.name")}
          </span>
          <span className="sidebar-brand-sub block truncate text-[11px]">
            {t("common", "brand.govt")}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
