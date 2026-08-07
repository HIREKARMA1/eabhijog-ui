import { Icon } from "@/components/icons/Icon";
import Link from "next/link";

import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { SectionLoader } from "@/components/ui/Spinner";

export default function HearingLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      <section className="border-b-2 border-saffron/20 bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="font-medium text-navy-700 hover:text-saffron hover:underline">
              Jana Samadhan
            </Link>
            <Icon name="chevron-right" size={14} className="text-slate-400" />
            <span className="truncate text-slate-600">Online Grievance Hearing</span>
          </nav>
          <div className="mt-6 h-24 animate-pulse rounded-lg bg-surface-muted" aria-hidden />
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="overflow-hidden rounded-lg border border-border bg-white px-4 py-16 sm:px-8">
          <SectionLoader label="Loading hearings…" />
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
