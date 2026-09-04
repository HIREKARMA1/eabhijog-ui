"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { grievanceListBackHref } from "@/lib/grievance/listQuery";

type GrievanceListBackLinkProps = {
  listHref: string;
  disposedListHref?: string;
  revertedListHref?: string;
  label?: string;
};

export function GrievanceListBackLink({
  listHref,
  disposedListHref,
  revertedListHref,
  label = "← Back to Grievances",
}: GrievanceListBackLinkProps) {
  const searchParams = useSearchParams();
  const href = grievanceListBackHref(
    listHref,
    disposedListHref ?? listHref.replace(/\/grievances\/?$/, "/disposed-grievances"),
    searchParams,
    revertedListHref ?? listHref.replace(/\/grievances\/?$/, "/reverted-grievances"),
  );

  return (
    <Link href={href} className="inline-flex text-sm font-medium text-brand hover:underline">
      {label}
    </Link>
  );
}
