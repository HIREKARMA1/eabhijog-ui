/** Design tokens — mirrors e-Abhijog server CSS variables. Change here to retheme the UI. */

export const theme = {
  colors: {
    navy950: "#0b1220",
    navy900: "#0f1b2d",
    navy800: "#162236",
    navy700: "#1e3a5f",
    navy600: "#2d4a6f",
    surface: "#f4f6f9",
    surfaceCard: "#ffffff",
    border: "#e5e9f0",
    textMuted: "#64748b",
    textPrimary: "#0f172a",
    saffron: "#ea580c",
    saffronHover: "#c2410c",
    success: "#059669",
    danger: "#dc2626",
    warning: "#d97706",
    landingBlue: "#2563eb",
    accentGradient:
      "linear-gradient(90deg, #dc2626, #ea580c, #a855f7, #2563eb, #15803d)",
    navAccentGradient:
      "linear-gradient(90deg, #dc2626, #ea580c, #a855f7, #2563eb, #0d9488)",
  },
  fonts: {
    sans: '"Segoe UI", system-ui, -apple-system, sans-serif',
    oriya: '"Noto Sans Oriya", "Segoe UI", system-ui, sans-serif',
    hindi: '"Noto Sans Devanagari", "Segoe UI", system-ui, sans-serif',
  },
  layout: {
    sidebarWidth: "260px",
    contentMaxWidth: "1120px",
    navMaxWidth: "1240px",
  },
  images: {
    pattachitraPattern: "/images/auth-pattachitra-pattern.svg",
    konarkWheel: "/images/auth-konark-wheel.svg",
    authFlowScene: "/images/auth-flow-scene.svg",
  },
} as const;

export type Theme = typeof theme;
