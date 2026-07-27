import Link from "next/link";
import { redirect } from "next/navigation";

import { PsMisView } from "@/components/ps/PsMisView";
import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { isMockDataMode } from "@/config/env";
import { serverApiRequest } from "@/lib/api/server";
import { getMockPsDashboard } from "@/lib/data/mock-loader";
import type { PsMisAnalyticsData } from "@/types/api";

function emptyMis(): PsMisAnalyticsData {
  return {
    summary: {
      total_grievances: 0,
      new_today: 0,
      pending_review: 0,
      under_osd_review: 0,
      forwarded_to_department: 0,
      waiting_for_department_response: 0,
      resolved: 0,
      closed: 0,
      high_priority: 0,
      overdue_cases: 0,
      pending: 0,
      disposed: 0,
      discarded: 0,
    },
    by_status: [],
    by_priority: [],
    by_osd: [],
    by_department: [],
    trend_14d: [],
  };
}

export default async function PsMisPage() {
  let data: PsMisAnalyticsData;

  try {
    if (isMockDataMode()) {
      const dash = await getMockPsDashboard();
      data = {
        ...emptyMis(),
        summary: {
          ...emptyMis().summary,
          ...dash.summary,
          pending: dash.summary.pending_review + dash.summary.forwarded_to_department,
          disposed: dash.summary.resolved + dash.summary.closed,
        },
      };
    } else {
      const result = await serverApiRequest<PsMisAnalyticsData>("/api/ps/mis");
      data = result.data;
    }
  } catch {
    redirect("/login");
  }

  return (
    <>
      <SetBreadcrumb>
        <Link href="/ps/dashboard" className="hover:text-slate-900 hover:underline">
          Private Secretary Dashboard
        </Link>
        {" > "}
        <strong className="text-slate-900">MIS</strong>
      </SetBreadcrumb>
      <PsMisView data={data} />
    </>
  );
}
