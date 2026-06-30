"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  external?: boolean;
};

const variants = {
  primary: "bg-saffron text-white hover:bg-saffron-hover",
  outline: "border border-border bg-white text-slate-700 hover:bg-surface",
  ghost: "text-slate-700 hover:bg-surface",
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
  external,
}: LinkButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
    variants[variant],
    className,
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
