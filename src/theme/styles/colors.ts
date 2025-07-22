import type { ThemeColors } from '../types/theme';

import { ColorValue } from 'react-native';

export type ColorScheme = {
  bg: ColorValue;
  border: ColorValue;
  hover: ColorValue;
  icon: ColorValue;
  solid: ColorValue;
}

export const colorMap: Record<string, ColorScheme> = {
  amber: {
    bg: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(245, 158, 11, 0.5)',
    hover: 'rgba(245, 158, 11, 0.7)',
    icon: '#f59e0b',
    solid: '#f59e0b',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.2)',
    border: 'rgba(59, 130, 246, 0.5)',
    hover: 'rgba(59, 130, 246, 0.7)',
    icon: '#3b82f6',
    solid: '#3b82f6',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.2)',
    border: 'rgba(6, 182, 212, 0.5)',
    hover: 'rgba(6, 182, 212, 0.7)',
    icon: '#06b6d4',
    solid: '#06b6d4',
  },
  gray: {
    bg: 'rgba(107, 114, 128, 0.2)',
    border: 'rgba(107, 114, 128, 0.5)',
    hover: 'rgba(107, 114, 128, 0.7)',
    icon: '#6b7280',
    solid: '#6b7280',
  },
  green: {
    bg: 'rgba(34, 197, 94, 0.2)',
    border: 'rgba(34, 197, 94, 0.5)',
    hover: 'rgba(34, 197, 94, 0.7)',
    icon: '#22c55e',
    solid: '#22c55e',
  },
  indigo: {
    bg: 'rgba(99, 102, 241, 0.2)',
    border: 'rgba(99, 102, 241, 0.5)',
    hover: 'rgba(99, 102, 241, 0.7)',
    icon: '#6366f1',
    solid: '#6366f1',
  },
  orange: {
    bg: 'rgba(249, 115, 22, 0.2)',
    border: 'rgba(249, 115, 22, 0.5)',
    hover: 'rgba(249, 115, 22, 0.7)',
    icon: '#f97316',
    solid: '#f97316',
  },
  pink: {
    bg: 'rgba(236, 72, 153, 0.2)',
    border: 'rgba(236, 72, 153, 0.5)',
    hover: 'rgba(236, 72, 153, 0.7)',
    icon: '#ec4899',
    solid: '#ec4899',
  },
  purple: {
    bg: 'rgba(168, 85, 247, 0.2)',
    border: 'rgba(168, 85, 247, 0.5)',
    hover: 'rgba(168, 85, 247, 0.7)',
    icon: '#a855f7',
    solid: '#a855f7',
  },
  red: {
    bg: 'rgba(239, 68, 68, 0.2)',
    border: 'rgba(239, 68, 68, 0.5)',
    hover: 'rgba(239, 68, 68, 0.7)',
    icon: '#ef4444',
    solid: '#ef4444',
  },
  teal: {
    bg: 'rgba(20, 184, 166, 0.2)',
    border: 'rgba(20, 184, 166, 0.5)',
    hover: 'rgba(20, 184, 166, 0.7)',
    icon: '#14b8a6',
    solid: '#14b8a6',
  },
  yellow: {
    bg: 'rgba(234, 179, 8, 0.2)',
    border: 'rgba(234, 179, 8, 0.5)',
    hover: 'rgba(234, 179, 8, 0.7)',
    icon: '#eab308',
    solid: '#eab308',
  }
};

export type ColorOption = keyof typeof colorMap;

export const getColorScheme = (color: ColorOption  ): ColorScheme => {
  return colorMap[color] || colorMap.blue;
};

export const LIGHT_COLORS: ThemeColors = {
  accent: {
    primary: '#000000'
  },
  background: {
    error: '#fef2f2',
    primary: '#ffffff',
    secondary: '#f8f9fa',
    subtle: '#f8f9fa',
    surface: '#ffffff',
    tertiary: '#e5e7eb'
  },
  border: {
    primary: '#e5e7eb'
  },
  card: '#ffffff',
  error: '#ef4444',
  muted: '#f8f9fa',
  success: '#22c55e',
  text: {
    error: '#ef4444',
    inverse: '#ffffff',
    primary: '#000000',
    secondary: '#6b7280',
    tertiary: '#9ca3af'
  }
};

export const DARK_COLORS: ThemeColors = {
  accent: {
    primary: '#ffffff'
  },
  background: {
    error: '#450a0a',
    primary: '#000000',
    secondary: '#1a1a1a',
    subtle: '#374151',
    surface: '#1a1a1a',
    tertiary: '#374151'
  },
  border: {
    primary: '#374151'
  },
  card: '#1a1a1a',
  error: '#ef4444',
  muted: '#374151',
  success: '#22c55e',
  text: {
    error: '#ef4444',
    inverse: '#000000',
    primary: '#ffffff',
    secondary: '#9ca3af',
    tertiary: '#6b7280'
  }
};

export type ColorTheme = 'dark' | 'light';

// Light theme colors (default)
export const PRIMARY_COLORS = {
  background: "#FFFFFF",           // White background
  border: "#E5E7EB",             // Light gray border
  error: "#EF4444",               // Red error
  overlay: "rgba(0, 0, 0, 0.5)",   // Modal overlays
  primary: "#000000",             // Black primary
  primaryGradient: ["#000000", "#374151"], // Black to dark gray gradient
  secondary: "#6B7280",           // Gray secondary
  social: {
    apple: {
      background: "#000000",
      border: "#374151",
      text: "#FFFFFF"
    },
    google: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      text: "#000000"
    }
  },
  success: "#10B981",             // Green success
  surface: "#F8F9FA",             // Very light gray surface
  text: {
    muted: "#9CA3AF",             // Light gray text
    primary: "#000000",           // Black text
    secondary: "#6B7280"         // Medium gray text
  },
  warning: "#F59E0B"             // Orange warning
} as const;

export type Colors = typeof PRIMARY_COLORS; 