"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";

type SidebarProfileMenuProps = {
  staffName: string;
  staffRole: string;
  staffInitials: string;
  onNavigate?: () => void;
};

export function SidebarProfileMenu({
  staffName,
  staffRole,
  staffInitials,
  onNavigate,
}: SidebarProfileMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleLinkClick() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div ref={rootRef} className="relative mx-3 mb-4">
      {open ? (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-navy-700 bg-navy-950 shadow-lg transition-all duration-150 ease-out"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={handleLinkClick}
            className="sidebar-nav-link block px-4 py-2.5 text-sm transition-colors hover:bg-navy-800"
          >
            {t("common", "actions.profile")}
          </Link>
          <Link
            href="/logout"
            role="menuitem"
            onClick={handleLinkClick}
            className="sidebar-nav-link block border-t border-navy-800 px-4 py-2.5 text-sm text-red-300 transition-colors hover:bg-navy-800"
          >
            {t("common", "actions.logout")}
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "sidebar-nav-link flex w-full items-center gap-3 rounded-lg border border-navy-800 bg-navy-950/40 px-3 py-3 text-left transition-all duration-150 ease-out hover:bg-navy-800 active:scale-[0.99]",
          open && "bg-navy-800",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">
          {staffInitials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="sidebar-brand-title block truncate text-sm font-medium">{staffName}</span>
          <span className="sidebar-role block truncate text-xs">{staffRole}</span>
        </span>
        <svg
          viewBox="0 0 20 20"
          width="16"
          height="16"
          aria-hidden="true"
          className={cn("shrink-0 text-sidebar-muted transition-transform", open && "rotate-180")}
        >
          <path
            fill="currentColor"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
          />
        </svg>
      </button>
    </div>
  );
}
