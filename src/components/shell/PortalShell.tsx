"use client";

import { useState } from "react";

import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import type { NavItem } from "@/lib/navigation/build-nav";
import type { AuthStaff } from "@/types/api";

type PortalShellProps = {
  staff: AuthStaff;
  homeHref: string;
  nav: NavItem[];
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

export function PortalShell({ staff, homeHref, nav, breadcrumb, children }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        homeHref={homeHref}
        nav={nav}
        staffName={staff.name}
        staffRole={formatRole(staff.role)}
        staffInitials={initials(staff.name)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar breadcrumb={breadcrumb} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
