"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LangSwitcher } from "@/components/i18n/LangSwitcher";
import { LegacyScripts } from "@/components/legacy/LegacyScripts";
import { useI18n } from "@/lib/i18n/context";
import type { NavItem } from "@/lib/navigation/build-nav";
import type { AuthStaff } from "@/types/api";

type AppShellProps = {
  staff: AuthStaff;
  homeHref: string;
  nav: NavItem[];
  breadcrumb?: React.ReactNode;
  bodyClass?: string;
  children: React.ReactNode;
};

export function AppShell({
  staff,
  homeHref,
  nav,
  breadcrumb,
  bodyClass = "",
  children,
}: AppShellProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = staff.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const backdrop = document.getElementById("sidebar-backdrop");
    const toggle = document.getElementById("sidebar-toggle");

    function closeSidebar() {
      setSidebarOpen(false);
      document.getElementById("app-sidebar")?.classList.remove("open");
      backdrop?.classList.remove("visible");
    }

    function openSidebar() {
      setSidebarOpen(true);
      document.getElementById("app-sidebar")?.classList.add("open");
      backdrop?.classList.add("visible");
    }

    toggle?.addEventListener("click", openSidebar);
    backdrop?.addEventListener("click", closeSidebar);

    return () => {
      toggle?.removeEventListener("click", openSidebar);
      backdrop?.removeEventListener("click", closeSidebar);
    };
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    document.getElementById("app-sidebar")?.classList.remove("open");
    document.getElementById("sidebar-backdrop")?.classList.remove("visible");
    setSidebarOpen(false);
  }, [pathname, sidebarOpen]);

  let lastSection = "";

  return (
    <div className={`app-body ${bodyClass}`.trim()}>
      <div className="app-shell">
        <div
          id="sidebar-backdrop"
          className={`sidebar-backdrop${sidebarOpen ? " visible" : ""}`}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={() => undefined}
          role="presentation"
        />

        <aside id="app-sidebar" className={`app-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-brand">
            <Link href={homeHref} className="no-underline">
              <div className="sidebar-brand-title">{t("common", "brand.name")}</div>
              <div className="sidebar-brand-sub">{t("common", "brand.govt")}</div>
            </Link>
          </div>

          <nav className="sidebar-nav">
            {nav.map((item) => {
              const section =
                item.section && item.section !== lastSection ? item.section : null;
              if (section) lastSection = item.section ?? lastSection;
              const label = item.labelKey.startsWith("osd.")
                ? t("dashboard", item.labelKey)
                : t("dashboard", item.labelKey);
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <div key={item.href}>
                  {section ? (
                    <div className="sidebar-section-label">{t("dashboard", section)}</div>
                  ) : null}
                  <Link
                    href={item.href}
                    className={`sidebar-link${active ? " active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon ? <span>{item.icon}</span> : null}
                    <span>{label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="badge-count">
                        {item.badge < 100 ? item.badge : "99+"}
                      </span>
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </nav>

          <Link href="/profile" className="sidebar-user sidebar-user-link">
            <div className="sidebar-avatar">{initials}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{staff.name}</div>
              <div className="text-xs text-slate-400 truncate">
                {staff.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
            </div>
          </Link>
        </aside>

        <div className="app-main">
          <header className="app-topbar">
            <div className="flex items-center gap-3 min-w-0">
              <button
                id="sidebar-toggle"
                type="button"
                className="lg:hidden btn btn-outline py-2 px-2"
                aria-label="Menu"
                onClick={() => {
                  setSidebarOpen(true);
                  document.getElementById("app-sidebar")?.classList.add("open");
                  document.getElementById("sidebar-backdrop")?.classList.add("visible");
                }}
              >
                ☰
              </button>
              <div className="breadcrumb min-w-0">
                {breadcrumb ?? (
                  <>
                    <span>{t("dashboard", "nav.dashboard")}</span> /{" "}
                    <strong>{t("dashboard", "nav.overview")}</strong>
                  </>
                )}
              </div>
            </div>
            <div className="topbar-actions">
              <LangSwitcher />
              <Link href="/profile" className="btn btn-outline text-xs">
                {t("common", "actions.profile")}
              </Link>
              <Link href="/logout" className="btn btn-outline text-xs">
                {t("common", "actions.logout")}
              </Link>
            </div>
          </header>

          <main className="app-content">{children}</main>
        </div>
      </div>

      <LegacyScripts scripts={["lang-toggle.js", "app.js"]} />
    </div>
  );
}
