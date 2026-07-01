import { DepartmentPortalPanel } from "@/components/department/DepartmentPortalPanel";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function DepartmentGrievancePage({ params }: PageProps) {
  const { token } = await params;
  return <DepartmentPortalPanel token={token} />;
}
