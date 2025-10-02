import type { ThemeConfiguration } from '@/theme/types/config';

import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const enum Variant {
  DARK = 'dark',
}

const colorsLight = {
  gray100: '#E4E4E7',      // Web border color
  gray200: '#A1A1A1',
  gray400: '#71717A',      // Web muted text
  gray50: '#F4F4F5',       // Web light gray
  gray800: '#0A0A0A',      // Web near black
  purple100: '#E1E1EF',
  purple50: '#1B1A23',
  purple500: '#236CE2',    // Web brand blue
  red500: '#EF4444',       // Web error red
  skeleton: '#A1A1A1',
  // Web brand colors
  orange500: '#F25D15',    // Web brand orange
  pink500: '#E25C64',      // Web brand pink
} as const;

const colorsDark = {
  gray100: '#2D3748',      // Web dark border
  gray200: '#94A3B8',      // Web muted light text
  gray400: '#71717A',      // Web muted gray
  gray50: '#F8FAFC',       // Web near white
  gray800: '#F8FAFC',      // Web near white
  purple100: '#252732',
  purple50: '#0C0A0F',     // Web very dark blue
  purple500: '#3B82F6',    // Web brighter blue for dark
  red500: '#B91C1C',       // Web darker red
  skeleton: '#2D3748',     // Web dark gray
  // Web brand colors for dark
  orange500: '#FF6B35',    // Web brighter orange for dark
  pink500: '#E25C64',      // Web brand pink
} as const;

const sizes = [12, 16, 24, 32, 40, 80] as const;

export const config = {
  backgrounds: colorsLight,
  borders: {
    colors: colorsLight,
    radius: [4, 16],
    widths: [1, 2],
  },
  colors: colorsLight,
  fonts: {
    colors: colorsLight,
    sizes,
  },
  gutters: sizes,
  navigationColors: {
    ...DefaultTheme.colors,
    background: colorsLight.gray50,
    card: colorsLight.gray50,
  },
  variants: {
    dark: {
      backgrounds: colorsDark,
      borders: {
        colors: colorsDark,
      },
      colors: colorsDark,
      fonts: {
        colors: colorsDark,
      },
      navigationColors: {
        ...DarkTheme.colors,
        background: colorsDark.purple50,
        card: colorsDark.purple50,
      },
    },
  },
} as const satisfies ThemeConfiguration;
