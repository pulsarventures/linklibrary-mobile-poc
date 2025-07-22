export const TYPOGRAPHY = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  lineHeights: {
    normal: 1.5,
    relaxed: 1.8,
    tight: 1.2
  },
  sizes: {
    lg: 18,      // Subtitles
    md: 16,      // Input text, buttons
    sm: 14,      // Form labels
    xl: 24,      // "Welcome back" title
    xs: 12,      // Small text like "Remember me"
    xxl: 28,     // Large titles
  },
  weights: {
    bold: "700",
    light: "300",
    medium: "500",
    regular: "400",
    semibold: "600"
  }
} as const;

export type Typography = typeof TYPOGRAPHY; 