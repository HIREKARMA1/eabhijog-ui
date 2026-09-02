/** URL params preserved when navigating list ↔ detail. */
export const GRIEVANCE_LIST_QUERY_KEYS = [
  "status",
  "district",
  "filing_source",
  "category",
  "osd_category",
  "search",
  "date_preset",
  "date_from",
  "date_to",
  "page",
] as const;

export function buildGrievanceListQueryString(
  filters: Record<string, string>,
  page?: number,
): string {
  const params = new URLSearchParams();
  for (const key of GRIEVANCE_LIST_QUERY_KEYS) {
    if (key === "page") continue;
    const value = filters[key];
    if (value) params.set(key, value);
  }
  const pageNum = page ?? Math.max(1, Number(filters.page || "1") || 1);
  if (pageNum > 1) params.set("page", String(pageNum));
  return params.toString();
}

export function grievanceListQueryFromSearchParams(
  searchParams: URLSearchParams | Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  const entries =
    searchParams instanceof URLSearchParams
      ? Array.from(searchParams.entries())
      : Object.entries(searchParams);

  for (const [key, value] of entries) {
    if (
      value &&
      (GRIEVANCE_LIST_QUERY_KEYS as readonly string[]).includes(key)
    ) {
      params.set(key, value);
    }
  }
  return params.toString();
}
