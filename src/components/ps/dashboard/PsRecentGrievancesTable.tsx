import { PsGrievanceTable } from "@/components/ps/PsGrievanceTable";
import type { PsGrievanceRow } from "@/types/api";

export function PsRecentGrievancesTable({
  items,
  detailHrefPrefix = "/ps/grievance/",
}: {
  items: PsGrievanceRow[];
  detailHrefPrefix?: string;
}) {
  return <PsGrievanceTable items={items} detailHrefPrefix={detailHrefPrefix} />;
}
