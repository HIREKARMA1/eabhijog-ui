import type { PsDashboardData, PsGrievanceRow } from "@/types/api";

import psDashboard from "@/data/mock/ps-dashboard.json";
import psGrievances from "@/data/mock/ps-grievances.json";

export async function getMockPsDashboard(): Promise<PsDashboardData> {
  return psDashboard as PsDashboardData;
}

export async function getMockPsGrievances(): Promise<{
  items: PsGrievanceRow[];
  total: number;
}> {
  const data = psGrievances as { items: PsGrievanceRow[]; total: number };
  return data;
}
