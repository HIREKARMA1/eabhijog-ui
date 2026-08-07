import { getClientApiBase, getServerApiBase } from "@/config/env";
import type { ApiEnvelope } from "@/types/api";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  server?: boolean;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const base = options.server ? getServerApiBase() : getClientApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
  };

  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      // Let the browser set the multipart boundary; do not force Content-Type.
      init.body = options.body;
    } else {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError("Network error", 0);
  }

  const payload = (await response.json()) as ApiEnvelope<T> & {
    error?: {
      message?: string;
      code?: string;
      details?: Record<string, unknown>;
    };
  };

  if (!response.ok || !payload.success) {
    const message = payload.error?.message ?? payload.message ?? "Request failed";
    throw new ApiError(
      message,
      response.status,
      payload.error?.code,
      payload.error?.details,
    );
  }

  return payload;
}
