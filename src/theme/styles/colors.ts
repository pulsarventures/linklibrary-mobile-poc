import { ColorValue } from 'react-native';
import type { ThemeColors } from '../types/theme';

export interface ColorScheme {
  bg: ColorValue;
  icon: ColorValue;
  border: ColorValue;
  hover: ColorValue;
  solid: ColorValue;
}

export const colorMap: Record<string, ColorScheme> = {
  red: {
    bg: 'rgba(239, 68, 68, 0.2)',
    icon: '#ef4444',
    border: 'rgba(239, 68, 68, 0.5)',
    hover: 'rgba(239, 68, 68, 0.7)',
    solid: '#ef4444',
  },
  orange: {
    bg: 'rgba(249, 115, 22, 0.2)',
    icon: '#f97316',
    border: 'rgba(249, 115, 22, 0.5)',
    hover: 'rgba(249, 115, 22, 0.7)',
    solid: '#f97316',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.2)',
    icon: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.5)',
    hover: 'rgba(245, 158, 11, 0.7)',
    solid: '#f59e0b',
  },
  yellow: {
    bg: 'rgba(234, 179, 8, 0.2)',
    icon: '#eab308',
    border: 'rgba(234, 179, 8, 0.5)',
    hover: 'rgba(234, 179, 8, 0.7)',
    solid: '#eab308',
  },
  green: {
    bg: 'rgba(34, 197, 94, 0.2)',
    icon: '#22c55e',
    border: 'rgba(34, 197, 94, 0.5)',
    hover: 'rgba(34, 197, 94, 0.7)',
    solid: '#22c55e',
  },
  teal: {
    bg: 'rgba(20, 184, 166, 0.2)',
    icon: '#14b8a6',
    border: 'rgba(20, 184, 166, 0.5)',
    hover: 'rgba(20, 184, 166, 0.7)',
    solid: '#14b8a6',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.2)',
    icon: '#06b6d4',
    border: 'rgba(6, 182, 212, 0.5)',
    hover: 'rgba(6, 182, 212, 0.7)',
    solid: '#06b6d4',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.2)',
    icon: '#3b82f6',
    border: 'rgba(59, 130, 246, 0.5)',
    hover: 'rgba(59, 130, 246, 0.7)',
    solid: '#3b82f6',
  },
  indigo: {
    bg: 'rgba(99, 102, 241, 0.2)',
    icon: '#6366f1',
    border: 'rgba(99, 102, 241, 0.5)',
    hover: 'rgba(99, 102, 241, 0.7)',
    solid: '#6366f1',
  },
  purple: {
    bg: 'rgba(168, 85, 247, 0.2)',
    icon: '#a855f7',
    border: 'rgba(168, 85, 247, 0.5)',
    hover: 'rgba(168, 85, 247, 0.7)',
    solid: '#a855f7',
  },
  pink: {
    bg: 'rgba(236, 72, 153, 0.2)',
    icon: '#ec4899',
    border: 'rgba(236, 72, 153, 0.5)',
    hover: 'rgba(236, 72, 153, 0.7)',
    solid: '#ec4899',
  },
  gray: {
    bg: 'rgba(107, 114, 128, 0.2)',
    icon: '#6b7280',
    border: 'rgba(107, 114, 128, 0.5)',
    hover: 'rgba(107, 114, 128, 0.7)',
    solid: '#6b7280',
  }
};

export type ColorOption = keyof typeof colorMap;

export const getColorScheme = (color: ColorOption | string): ColorScheme => {
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

export const LIGHT_COLORS: ThemeColors = {
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    error: '#ef4444'
  },
  background: {
    primary: '#ffffff',
    secondary: '#f3f4f6',
    tertiary: '#e5e7eb',
    error: '#fef2f2',
    surface: '#ffffff',
    subtle: '#f3f4f6'
  },
  border: {
    primary: '#e5e7eb'
  },
  accent: {
    primary: '#a855f7'
  },
  card: '#ffffff',
  muted: '#f3f4f6',
  error: '#ef4444',
  success: '#22c55e'
};

export const DARK_COLORS: ThemeColors = {
  text: {
    primary: '#f3f4f6',
    secondary: '#9ca3af',
    tertiary: '#6b7280',
    inverse: '#000000',
    error: '#ef4444'
  },
  background: {
    primary: '#111827',
    secondary: '#1f2937',
    tertiary: '#374151',
    error: '#450a0a',
    surface: '#1f2937',
    subtle: '#374151'
  },
  border: {
    primary: '#374151'
  },
  accent: {
    primary: '#a855f7'
  },
  card: '#1f2937',
  muted: '#374151',
  error: '#ef4444',
  success: '#22c55e'
};

export type ColorTheme = 'light' | 'dark';

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