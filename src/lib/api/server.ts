import { cookies } from "next/headers";

import { getServerApiBase } from "@/config/env";
import type { ApiEnvelope } from "@/types/api";

function buildCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function serverApiRequest<T>(path: string): Promise<ApiEnvelope<T>> {
  const cookieStore = await cookies();
  const cookieHeader = buildCookieHeader(cookieStore);
  const url = `${getServerApiBase()}${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiEnvelope<T> & {
    error?: { message?: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? payload.message ?? "Request failed");
  }

  return payload;
}
