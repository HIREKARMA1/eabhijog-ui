export const STATUS_MESSAGE_STATUSES = new Set(["resolved", "closed", "cancelled"]);

export type StatusMessageTemplateKey = "resolved" | "closed" | "cancelled";

type BuildStatusMessageInput = {
  citizenName: string;
  referenceNumber: string;
};

const REMARKS_PLACEHOLDER: Record<StatusMessageTemplateKey, string> = {
  resolved: "[Resolution Details]",
  closed: "[Closure Remarks]",
  cancelled: "[Reason for Rejection]",
};

const TEMPLATE_BODIES: Record<StatusMessageTemplateKey, string> = {
  resolved: `Dear [Name], your grievance [Grievance ID] has been resolved by the Office of the Hon'ble Minister, Commerce, Transport, Steel & Mines.

Remarks: ${REMARKS_PLACEHOLDER.resolved}

— Jana Samadhan`,
  closed: `Dear [Name], your grievance [Grievance ID] has been closed after necessary action by the concerned authority.

Remarks: ${REMARKS_PLACEHOLDER.closed}

— Jana Samadhan`,
  cancelled: `Dear [Name], your grievance [Grievance ID] has been rejected.

Reason: ${REMARKS_PLACEHOLDER.cancelled}

— Jana Samadhan`,
};

export function isStatusMessageStatus(status: string): status is StatusMessageTemplateKey {
  return STATUS_MESSAGE_STATUSES.has(status);
}

export function buildStatusCitizenMessage(
  status: StatusMessageTemplateKey,
  input: BuildStatusMessageInput,
): string {
  const name = input.citizenName.trim() || "Citizen";
  const ref = input.referenceNumber.trim();

  return TEMPLATE_BODIES[status]
    .replace(/\[Name\]/g, name)
    .replace(/\[Grievance ID\]/g, ref);
}

export function buildForwardCitizenMessage(input: {
  citizenName: string;
  referenceNumber: string;
  departmentName: string;
  remarks: string;
}): string {
  const name = input.citizenName.trim() || "Citizen";
  const ref = input.referenceNumber.trim();
  const department = input.departmentName.trim() || "[Department Name]";
  const remarks = input.remarks.trim() || "[Remarks]";

  return `Dear ${name}, your grievance ${ref} has been forwarded to ${department} for necessary action.

Remarks: ${remarks}

— Jana Samadhan`;
}
