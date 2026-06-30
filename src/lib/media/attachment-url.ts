import { env } from "@/config/env";

/** Public URL for a stored grievance attachment (proxied via Next.js /backend). */
export function attachmentPublicUrl(filePath: string): string {
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const normalized = filePath.replace(/\\/g, "/");
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${env.apiPrefix}${path}`;
}

export function attachmentFileName(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.split("/").pop() ?? filePath;
}

export function isViewableAttachmentPath(filePath: string): boolean {
  return Boolean(filePath) && filePath !== "[REDACTED]" && !filePath.includes("REDACTED");
}
