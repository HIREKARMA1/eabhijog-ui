/** Runtime configuration from environment variables only. */

function required(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export const env = {
  apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:8000",
  apiPrefix: process.env.NEXT_PUBLIC_API_PREFIX ?? "/backend",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en") as "en" | "hi" | "or",
};

export function getClientApiBase(): string {
  if (typeof window === "undefined") {
    return env.apiBaseUrl;
  }
  return env.apiPrefix;
}

export function getServerApiBase(): string {
  return env.apiBaseUrl;
}
