"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { grievanceListBackHref } from "@/lib/grievance/listQuery";
import { cn } from "@/lib/utils/cn";

type GrievanceListBackLinkProps = {
  listHref: string;
  disposedListHref?: string;
  revertedListHref?: string;
  label?: string;
  asButton?: boolean;
  align?: "start" | "end";
};

export function GrievanceListBackLink({
  listHref,
  disposedListHref,
  revertedListHref,
  label = "← Back to Grievances",
  asButton = false,
  align = "start",
}: GrievanceListBackLinkProps) {
  const searchParams = useSearchParams();
  const href = grievanceListBackHref(
    listHref,
    disposedListHref ?? listHref.replace(/\/grievances\/?$/, "/disposed-grievances"),
    searchParams,
    revertedListHref ?? listHref.replace(/\/grievances\/?$/, "/reverted-grievances"),
  );

  return (
    <div className={cn("flex", align === "end" ? "justify-end" : "justify-start")}>
      <Link
        href={href}
        className={
          asButton
            ? "inline-flex items-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            : "inline-flex text-sm font-medium text-brand hover:underline"
        }
      >
        {label}
      </Link>
    </div>
  );
}
