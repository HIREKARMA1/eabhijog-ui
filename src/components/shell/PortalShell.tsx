"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { BreadcrumbProvider, useBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { formatStaffRole } from "@/lib/auth/roles";
import type { NavItem } from "@/lib/navigation/build-nav";
import { osdCategoryForRole } from "@/lib/osd/desks";
import type { AuthStaff } from "@/types/api";

type PortalShellProps = {
  staff: AuthStaff;
  homeHref: string;
  nav: NavItem[];
  /** @deprecated Prefer SetBreadcrumb from page content; kept for rare static titles. */
  breadcrumb?: React.ReactNode;
  /** Persistent top-bar desk title, e.g. "Commerce & Transport - OSD". */
  contextTitle?: string;
  children: React.ReactNode;
};

function staffRoleLabel(staff: AuthStaff): string {
  return staff.osd_category ?? osdCategoryForRole(staff.role) ?? formatStaffRole(staff.role);
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
  contextTitle,
  children,
}: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { breadcrumb: dynamicBreadcrumb } = useBreadcrumb();
  const breadcrumb = dynamicBreadcrumb ?? staticBreadcrumb;
  const pathname = usePathname();
  const mainRef = useRef<HTMLDivElement>(null);

  // Content scrolls inside <main>, not the window - reset on every route change.
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
          staffRole={staffRoleLabel(staff)}
          staffInitials={initials(staff.name)}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar
            title={contextTitle}
            breadcrumb={breadcrumb}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <div ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <main className="px-3 py-3 sm:px-4 sm:py-5 md:px-6 md:py-6">{children}</main>
            <PortalFooter />
          </div>
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
