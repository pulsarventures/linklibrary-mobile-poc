export const PRIMARY_COLORS = {
  background: "#0F1117",           // Dark background from screenshot
  surface: "#1A1D26",             // Input field background
  primary: "#7C3AED",             // Primary purple button with gradient
  primaryGradient: ["#7C3AED", "#2563EB"], // Button gradient
  secondary: "#64748B",           // Secondary elements
  success: "#10B981",             // Green connection status
  error: "#EF4444",               // Error states, validation
  warning: "#F59E0B",             // Warning states
  text: {
    primary: "#FFFFFF",           // White text
    secondary: "#94A3B8",         // Gray text like "Sign in to continue"
    muted: "#64748B"             // Even more muted text
  },
  border: "#2A2F3A",             // Dark border color for inputs
  overlay: "rgba(0, 0, 0, 0.5)",   // Modal overlays
  social: {
    google: {
      background: "#1A1D26",
      border: "#2A2F3A",
      text: "#FFFFFF"
    },
    apple: {
      background: "#1A1D26",
      border: "#2A2F3A",
      text: "#FFFFFF"
    }
  }
} as const;

export type Colors = typeof PRIMARY_COLORS; 