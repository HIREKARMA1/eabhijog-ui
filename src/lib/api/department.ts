import { apiRequest } from "@/lib/api/client";
import type { DepartmentGrievanceView } from "@/types/api";

export async function fetchDepartmentGrievance(token: string) {
  return apiRequest<DepartmentGrievanceView>(`/api/department/grievances/${encodeURIComponent(token)}`);
}

export async function acknowledgeDepartmentGrievance(
  token: string,
  payload: { officer_name: string; remarks?: string },
) {
  return apiRequest<{ reference_number: string; status: string }>(
    `/api/department/grievances/${encodeURIComponent(token)}/acknowledge`,
    { method: "POST", body: payload },
  );
}

export async function respondDepartmentGrievance(
  token: string,
  payload: { officer_name: string; response_text: string },
) {
  return apiRequest<{ reference_number: string; status: string }>(
    `/api/department/grievances/${encodeURIComponent(token)}/respond`,
    { method: "POST", body: payload },
  );
}
