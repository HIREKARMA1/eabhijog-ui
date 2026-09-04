/** Runtime configuration from environment variables only. */

function required(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export type DataSource = "api" | "mock";
export type Locale = "en" | "hi" | "or";

function parseDataSource(value: string | undefined): DataSource {
  const v = (value ?? "api").trim().toLowerCase();
  return v === "mock" ? "mock" : "api";
}

function parseLocale(value: string | undefined): Locale {
  const v = (value ?? "en").trim().toLowerCase();
  if (v === "hi" || v === "or") return v;
  return "en";
}

export const env = {
  apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:8000",
  apiPrefix: process.env.NEXT_PUBLIC_API_PREFIX ?? "/backend",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  defaultLocale: parseLocale(process.env.NEXT_PUBLIC_DEFAULT_LOCALE),
  dataSource: parseDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE),
};

export function isMockDataMode(): boolean {
  return env.dataSource === "mock";
}

export function getClientApiBase(): string {
  if (typeof window === "undefined") {
    return buildServerApiBase();
  }
  return env.apiPrefix;
}

function appUrlScheme(): string {
  try {
    return new URL(env.appUrl).protocol.replace(":", "") || "http";
  } catch {
    return "http";
  }
}

/** Same-origin /backend proxy base for RSC (matches browser login cookie path). */
export function buildServerApiBase(host?: string | null, proto?: string | null): string {
  const prefix = env.apiPrefix.startsWith("/") ? env.apiPrefix : `/${env.apiPrefix}`;
  if (host) {
    // Prefer forwarded proto; else APP_URL scheme (local default http). Never hard-default https.
    const forwarded = proto?.split(",")[0]?.trim();
    const scheme = forwarded || appUrlScheme();
    return `${scheme}://${host}${prefix}`;
  }
  const appUrl = env.appUrl.replace(/\/$/, "");
  return `${appUrl}${prefix}`;
}

/** @deprecated Prefer serverApiRequest. Returns FastAPI origin for server-side calls. */
export function getServerApiBase(): string {
  return env.apiBaseUrl.replace(/\/$/, "");
}
