import { HearingDesk } from "@/components/hearing/HearingDesk";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";

export default function AdminHearingsPage() {
  return (
    <PortalLayout>
      <SetBreadcrumb>
        <strong>Online Grievance Hearing</strong>
      </SetBreadcrumb>
      <HearingDesk canManage />
    </PortalLayout>
  );
}
