import { PortalLayout } from "@/components/layout/PortalLayout";
import { StaffManagementPanel } from "@/components/staff/StaffManagementPanel";

export default function StaffPage() {
  return (
    <PortalLayout breadcrumb="Staff">
      <StaffManagementPanel />
    </PortalLayout>
  );
}
