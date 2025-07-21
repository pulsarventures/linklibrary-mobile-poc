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
    primary: '#000000',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    error: '#ef4444'
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#e5e7eb',
    error: '#fef2f2',
    surface: '#ffffff',
    subtle: '#f8f9fa'
  },
  border: {
    primary: '#e5e7eb'
  },
  accent: {
    primary: '#000000'
  },
  card: '#ffffff',
  muted: '#f8f9fa',
  error: '#ef4444',
  success: '#22c55e'
};

export const DARK_COLORS: ThemeColors = {
  text: {
    primary: '#ffffff',
    secondary: '#9ca3af',
    tertiary: '#6b7280',
    inverse: '#000000',
    error: '#ef4444'
  },
  background: {
    primary: '#000000',
    secondary: '#1a1a1a',
    tertiary: '#374151',
    error: '#450a0a',
    surface: '#1a1a1a',
    subtle: '#374151'
  },
  border: {
    primary: '#374151'
  },
  accent: {
    primary: '#ffffff'
  },
  card: '#1a1a1a',
  muted: '#374151',
  error: '#ef4444',
  success: '#22c55e'
};

export type ColorTheme = 'light' | 'dark';

// Light theme colors (default)
export const PRIMARY_COLORS = {
  background: "#FFFFFF",           // White background
  surface: "#F8F9FA",             // Very light gray surface
  primary: "#000000",             // Black primary
  primaryGradient: ["#000000", "#374151"], // Black to dark gray gradient
  secondary: "#6B7280",           // Gray secondary
  success: "#10B981",             // Green success
  error: "#EF4444",               // Red error
  warning: "#F59E0B",             // Orange warning
  text: {
    primary: "#000000",           // Black text
    secondary: "#6B7280",         // Medium gray text
    muted: "#9CA3AF"             // Light gray text
  },
  border: "#E5E7EB",             // Light gray border
  overlay: "rgba(0, 0, 0, 0.5)",   // Modal overlays
  social: {
    google: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      text: "#000000"
    },
    apple: {
      background: "#000000",
      border: "#374151",
      text: "#FFFFFF"
    }
  }
} as const;

export type Colors = typeof PRIMARY_COLORS; 