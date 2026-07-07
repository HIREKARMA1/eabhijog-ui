"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/icons/Icon";
import { SidebarProfileMenu } from "@/components/shell/SidebarProfileMenu";
import { useI18n } from "@/lib/i18n/context";
import type { NavItem } from "@/lib/navigation/build-nav";
import { cn } from "@/lib/utils/cn";

type SidebarProps = {
  nav: NavItem[];
  staffName: string;
  staffRole: string;
  staffInitials: string;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({
  nav,
  staffName,
  staffRole,
  staffInitials,
  open,
  onClose,
}: SidebarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  let lastSection = "";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-navy-950/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "portal-sidebar fixed bottom-0 left-0 top-0 z-50 flex flex-col overflow-hidden border-r border-navy-800 bg-navy-900 transition-transform lg:top-[var(--portal-navbar-height)]",
          "w-[var(--portal-sidebar-width)]",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <nav className="flex-1 overflow-hidden px-3 py-4 pt-5">
          {nav.map((item) => {
            const section =
              item.section && item.section !== lastSection ? item.section : null;
            if (section) lastSection = item.section ?? lastSection;

            const label = item.labelKey.startsWith("osd.")
              ? t("dashboard", item.labelKey)
              : item.labelKey.startsWith("ps.")
                ? t("ps", item.labelKey.replace("ps.", ""))
                : t("dashboard", item.labelKey);

            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <div key={item.href} className="mb-1">
                {section ? (
                  <p className="sidebar-section-label mb-2 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider first:mt-0">
                    {t("dashboard", section)}
                  </p>
                ) : null}
                <Link
                  href={item.href}
                  onClick={onClose}
                  data-active={active ? "true" : undefined}
                  className={cn(
                    "sidebar-nav-link flex items-center gap-3 rounded-lg border-l-2 py-2.5 pr-3 text-sm font-medium transition-colors",
                    active
                      ? "border-saffron bg-navy-700 pl-[calc(0.75rem-2px)]"
                      : "border-transparent pl-3 hover:bg-navy-800",
                  )}
                >
                  {item.icon ? (
                    <Icon
                      name={item.icon as IconName}
                      size={18}
                      className={cn("shrink-0", active ? "opacity-100" : "opacity-80")}
                    />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="rounded-full bg-saffron px-2 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge < 100 ? item.badge : "99+"}
                    </span>
                  ) : null}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0">
          <SidebarProfileMenu
            staffName={staffName}
            staffRole={staffRole}
            staffInitials={staffInitials}
            onNavigate={onClose}
          />
        </div>
      </aside>
    </>
  );
}
