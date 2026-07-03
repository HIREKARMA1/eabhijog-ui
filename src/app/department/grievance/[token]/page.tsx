import { DepartmentPortal } from "@/components/department/DepartmentPortal";

type PageProps = { params: Promise<{ token: string }> };

export default async function DepartmentPortalPage({ params }: PageProps) {
  const { token } = await params;
  return <DepartmentPortal token={token} />;
}
