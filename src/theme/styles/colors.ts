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
    primary: '#F25D15',  // Web brand orange
    secondary: '#236CE2' // Web brand blue
  },
  background: {
    error: '#fef2f2',
    primary: '#ffffff',    // Pure white from web
    secondary: '#f4f4f5',  // Light gray from web
    subtle: '#f4f4f5',     // Muted background from web
    surface: '#ffffff',    // Card background from web
    tertiary: '#e4e4e7'    // Border color from web
  },
  border: {
    primary: '#e4e4e7'     // Web border color
  },
  card: '#ffffff',         // Web card background
  error: '#ef4444',
  muted: '#f4f4f5',        // Web muted background
  success: '#16a34a',      // Web success green
  text: {
    error: '#ef4444',
    inverse: '#ffffff',
    primary: '#0a0a0a',    // Web near black
    secondary: '#71717a',  // Web muted text
    tertiary: '#9ca3af'
  }
};

export const DARK_COLORS: ThemeColors = {
  accent: {
    primary: '#FF6B35',    // Web brighter orange for dark
    secondary: '#3B82F6'   // Web brighter blue for dark
  },
  background: {
    error: '#450a0a',
    primary: '#0c0a0f',    // Web very dark blue
    secondary: '#2d3748',  // Web dark gray
    subtle: '#2d3748',     // Web muted dark background
    surface: '#0c0a0f',    // Web dark card background
    tertiary: '#2d3748'    // Web dark border
  },
  border: {
    primary: '#2d3748'     // Web dark border
  },
  card: '#0c0a0f',         // Web dark card background
  error: '#b91c1c',        // Web darker red
  muted: '#2d3748',        // Web muted dark background
  success: '#16a34a',      // Web success green
  text: {
    error: '#b91c1c',      // Web darker red
    inverse: '#0c0a0f',    // Web dark background
    primary: '#f8fafc',    // Web near white
    secondary: '#94a3b8',  // Web muted light text
    tertiary: '#71717a'    // Web muted gray
  }
};

export type ColorTheme = 'dark' | 'light';

// Light theme colors (default) - Updated to match web design
export const PRIMARY_COLORS = {
  background: "#FFFFFF",           // Pure white from web
  border: "#E4E4E7",             // Web border color
  error: "#EF4444",               // Red error
  overlay: "rgba(0, 0, 0, 0.5)",   // Modal overlays
  primary: "#F25D15",             // Web brand orange
  primaryGradient: ["#236CE2", "#F25D15"], // Web blue to orange gradient
  secondary: "#71717A",           // Web muted text
  social: {
    apple: {
      background: "#000000",
      border: "#2D3748",          // Web dark border
      text: "#FFFFFF"
    },
    google: {
      background: "#FFFFFF",
      border: "#E4E4E7",          // Web border
      text: "#0A0A0A"             // Web near black
    }
  },
  success: "#16A34A",             // Web success green
  surface: "#F4F4F5",             // Web light gray surface
  text: {
    muted: "#71717A",             // Web muted text
    primary: "#0A0A0A",           // Web near black
    secondary: "#71717A"          // Web muted text
  },
  warning: "#F59E0B",             // Orange warning
  // Web brand colors
  accentOrange: "#F25D15",        // Main brand orange
  accentCerulean: "#236CE2",      // Brand blue
  logoPink: "#E25C64"             // Brand pink
} as const;

export type Colors = typeof PRIMARY_COLORS; 