const CLOSED_STATUSES = new Set(["resolved", "closed", "cancelled"]);

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function cell(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

export function daysPending(createdAt: string, status: string): number | null {
  if (CLOSED_STATUSES.has(status)) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const diffMs = Date.now() - created.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatDaysPending(createdAt: string, status: string): string {
  const days = daysPending(createdAt, status);
  if (days === null) return "—";
  return String(days);
}

export function formatResolutionHours(hours: number | null | undefined): string {
  if (hours == null || hours <= 0) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours} hrs`;
}

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}
