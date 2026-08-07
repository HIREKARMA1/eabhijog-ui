import { HearingDesk } from "@/components/hearing/HearingDesk";
import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";

export default function PsHearingsPage() {
  return (
    <>
      <SetBreadcrumb>
        <strong>Online Grievance Hearing</strong>
      </SetBreadcrumb>
      <HearingDesk canManage />
    </>
  );
}
