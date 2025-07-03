export const TYPOGRAPHY = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  sizes: {
    xs: 12,      // Small text like "Remember me"
    sm: 14,      // Form labels
    md: 16,      // Input text, buttons
    lg: 18,      // Subtitles
    xl: 24,      // "Welcome back" title
    xxl: 28,     // Large titles
  },
  weights: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700"
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8
  }
} as const;

export type Typography = typeof TYPOGRAPHY; 