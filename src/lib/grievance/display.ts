const CLOSED_STATUSES = new Set(["resolved", "closed", "cancelled", "reverted"]);

export const FORWARD_VIA_FORM_ONLY_STATUS = "forwarded_to_department";

/** Curated statuses shown in the OSD Update Status dropdown (display order). */
export const OSD_UPDATE_STATUS_WHITELIST = [
  "pending_review",
  "resolved",
  "closed",
  "cancelled",
  "reverted",
  FORWARD_VIA_FORM_ONLY_STATUS,
] as const;

const STATUS_DISPLAY_LABELS: Record<string, string> = {
  pending_review: "Pending review",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Rejected",
  reverted: "Send back to citizen",
  forwarded_to_department: "Forwarded to department",
  department_action_pending: "Department action pending",
  action_taken: "Action taken",
  in_progress: "In progress",
  new: "New",
  open: "Open",
  acknowledged: "Acknowledged",
  assigned: "Assigned",
};

/** Badge / table label (distinct from dropdown wording for revert). */
export function formatStatusLabel(status: string): string {
  if (status === "reverted") return "Reverted to citizen";
  const mapped = STATUS_DISPLAY_LABELS[status];
  if (mapped) return mapped;
  const words = status.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Dropdown option label (Send back to citizen for revert). */
export function formatOsdStatusOptionLabel(status: string): string {
  const mapped = STATUS_DISPLAY_LABELS[status];
  if (mapped) return mapped;
  return formatStatusLabel(status);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function cell(value: string | null | undefined): string {
  return value?.trim() ? value : "-";
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
  if (days === null) return "-";
  return String(days);
}

export function formatResolutionHours(hours: number | null | undefined): string {
  if (hours == null || hours <= 0) return "-";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours} hrs`;
}

export function formatPriorityLabel(priority: string): string {
  const words = priority.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function filterOsdUpdateStatusOptions(
  allowedStatuses: string[],
  currentStatus: string,
): string[] {
  if (currentStatus === "reverted") {
    return ["reverted"];
  }
  const allowed = new Set(allowedStatuses);
  // Always keep Forwarded to department in the curated Update Status list.
  allowed.add(FORWARD_VIA_FORM_ONLY_STATUS);
  const whitelist = OSD_UPDATE_STATUS_WHITELIST.filter(
    (status) => allowed.has(status) || status === currentStatus,
  );
  if (whitelist.includes(currentStatus as (typeof OSD_UPDATE_STATUS_WHITELIST)[number])) {
    return [...whitelist];
  }
  return [currentStatus, ...whitelist];
}
