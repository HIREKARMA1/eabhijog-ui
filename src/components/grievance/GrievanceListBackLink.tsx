"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { grievanceListQueryFromSearchParams } from "@/lib/grievance/listQuery";

type GrievanceListBackLinkProps = {
  listHref: string;
  label?: string;
};

export function GrievanceListBackLink({
  listHref,
  label = "← Back to Grievances",
}: GrievanceListBackLinkProps) {
  const searchParams = useSearchParams();
  const returnQuery = grievanceListQueryFromSearchParams(searchParams);
  const href = returnQuery ? `${listHref}?${returnQuery}` : listHref;

  return (
    <Link href={href} className="inline-flex text-sm font-medium text-brand hover:underline">
      {label}
    </Link>
  );
}
