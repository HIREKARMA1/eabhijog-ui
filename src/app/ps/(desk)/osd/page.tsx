import Link from "next/link";

import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { PsOsdManagementPanel } from "@/components/ps/PsOsdManagementPanel";

export default function PsOsdPage() {
  return (
    <>
      <SetBreadcrumb>
        <Link href="/ps/dashboard" className="hover:text-slate-900 hover:underline">
          Private Secretary Dashboard
        </Link>
        {" > "}
        <strong className="text-slate-900">OSD Accounts</strong>
      </SetBreadcrumb>
      <PsOsdManagementPanel />
    </>
  );
}
