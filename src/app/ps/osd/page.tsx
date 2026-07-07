import Link from "next/link";

import { PsLayout } from "@/components/layout/PsLayout";
import { PsOsdManagementPanel } from "@/components/ps/PsOsdManagementPanel";

export default function PsOsdPage() {
  return (
    <PsLayout
      breadcrumb={
        <>
          <Link href="/ps/dashboard" className="hover:text-slate-900 hover:underline">
            Private Secretary Dashboard
          </Link>
          {" > "}
          <strong className="text-slate-900">OSD Accounts</strong>
        </>
      }
    >
      <PsOsdManagementPanel />
    </PsLayout>
  );
}
