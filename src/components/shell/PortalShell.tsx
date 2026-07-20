"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { BreadcrumbProvider, useBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import type { NavItem } from "@/lib/navigation/build-nav";
import type { AuthStaff } from "@/types/api";

type PortalShellProps = {
  staff: AuthStaff;
  homeHref: string;
  nav: NavItem[];
  /** @deprecated Prefer SetBreadcrumb from page content; kept for rare static titles. */
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
};

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PortalShellInner({
  staff,
  homeHref,
  nav,
  breadcrumb: staticBreadcrumb,
  children,
}: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { breadcrumb: dynamicBreadcrumb } = useBreadcrumb();
  const breadcrumb = dynamicBreadcrumb ?? staticBreadcrumb;
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // Content scrolls inside <main>, not the window — reset on every route change.
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <GovtNavbar homeHref={homeHref} onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <div
          className="hidden shrink-0 lg:block"
          style={{ width: "var(--portal-sidebar-width)" }}
          aria-hidden="true"
        />
        <Sidebar
          nav={nav}
          staffName={staff.name}
          staffRole={formatRole(staff.role)}
          staffInitials={initials(staff.name)}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar breadcrumb={breadcrumb} onMenuClick={() => setSidebarOpen(true)} />
          <main
            ref={mainRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6 md:py-6"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function PortalShell(props: PortalShellProps) {
  return (
    <BreadcrumbProvider>
      <PortalShellInner {...props} />
    </BreadcrumbProvider>
  );
}
