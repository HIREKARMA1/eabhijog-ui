/** Meta HSM template variable {{1}} practical limit for staff-reply WhatsApp sends. */
export const CITIZEN_WHATSAPP_MAX_CHARS = 500;

export const STATUS_MESSAGE_STATUSES = new Set([
  "resolved",
  "closed",
  "cancelled",
  "reverted",
]);

export type StatusMessageTemplateKey = "resolved" | "closed" | "cancelled" | "reverted";

export function isStatusMessageStatus(status: string): status is StatusMessageTemplateKey {
  return STATUS_MESSAGE_STATUSES.has(status);
}

export function citizenMessageExceedsWhatsAppLimit(message: string): boolean {
  return message.trim().length > CITIZEN_WHATSAPP_MAX_CHARS;
}

export function citizenWhatsAppLengthError(message: string): string | null {
  const len = message.trim().length;
  if (len <= CITIZEN_WHATSAPP_MAX_CHARS) return null;
  return `WhatsApp message is too long (${len}/${CITIZEN_WHATSAPP_MAX_CHARS} characters). Shorten it before sending.`;
}
