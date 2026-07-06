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
    return env.apiBaseUrl;
  }
  return env.apiPrefix;
}

export function getServerApiBase(): string {
  return env.apiBaseUrl;
}
