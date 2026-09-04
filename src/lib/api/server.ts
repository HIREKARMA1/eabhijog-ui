import { cookies } from "next/headers";

import { env } from "@/config/env";
import type { ApiEnvelope } from "@/types/api";

function buildCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

/**
 * RSC calls FastAPI directly. Forwarding UI session cookies works because the
 * Starlette session is cookie-payload based. Avoids self-fetch through Next
 * rewrites (http/https mismatch and loopback failures that cause login loops).
 */
function resolveServerApiBase(): string {
  return env.apiBaseUrl.replace(/\/$/, "");
}

export async function serverApiRequest<T>(path: string): Promise<ApiEnvelope<T>> {
  const cookieStore = await cookies();
  const cookieHeader = buildCookieHeader(cookieStore);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${resolveServerApiBase()}${normalizedPath}`;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
  };
  if (cookieHeader) {
    requestHeaders.Cookie = cookieHeader;
  }

  const response = await fetch(url, {
    headers: requestHeaders,
    cache: "no-store",
  }).catch((err: unknown) => {
    const cause = err instanceof Error && "cause" in err ? String(err.cause) : "";
    const isRefused =
      cause.includes("ECONNREFUSED") ||
      (err instanceof Error && err.message.includes("fetch failed"));
    if (isRefused) {
      throw new Error(
        "API server unreachable. Start the backend: cd eabhijog-server && uvicorn app.main:app --reload --port 8000",
      );
    }
    throw err;
  });

  const payload = (await response.json()) as ApiEnvelope<T> & {
    error?: { message?: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? payload.message ?? "Request failed");
  }

  return payload;
}
