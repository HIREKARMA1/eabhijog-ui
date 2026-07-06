/**
 * Single source of truth for colors, typography, and layout.
 * CSS variables in globals.css mirror these values.
 */

export const colors = {
  navy950: "#0b1220",
  navy900: "#0f1b2d",
  navy800: "#162236",
  navy700: "#1e3a5f",
  navy600: "#2d4a6f",
  surface: "#f4f6f9",
  surfaceMuted: "#eef2f7",
  surfaceCard: "#ffffff",
  border: "#e5e9f0",
  textPrimary: "#0f172a",
  textMuted: "#64748b",
  saffron: "#ea580c",
  saffronHover: "#c2410c",
  success: "#059669",
  danger: "#dc2626",
  warning: "#d97706",
  link: "#1e3a5f",
  sidebarText: "#e2e8f0",
  sidebarTextMuted: "#94a3b8",
  sidebarSection: "#7c8fa8",
  sidebarTextActive: "#ffffff",
} as const;

export const fonts = {
  sans: '"Segoe UI", system-ui, -apple-system, sans-serif',
  oriya: '"Noto Sans Oriya", "Segoe UI", system-ui, sans-serif',
  hindi: '"Noto Sans Devanagari", "Segoe UI", system-ui, sans-serif',
} as const;

export const layout = {
  sidebarWidth: "16.25rem",
  contentMaxWidth: "70rem",
  pagePadding: "1rem",
  pagePaddingMd: "1.5rem",
} as const;

export const radii = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
} as const;

export const theme = { colors, fonts, layout, radii } as const;

export type Theme = typeof theme;
