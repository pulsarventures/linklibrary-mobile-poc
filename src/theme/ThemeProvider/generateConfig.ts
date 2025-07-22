import type { ThemeConfiguration, Variant } from '@/theme/types/config';

import { PRIMARY_COLORS } from '@/theme/styles';

const generateConfig = (variant: Variant): ThemeConfiguration => {
  const isDark = variant === 'dark';

  const themeConfig = {
    backgrounds: {
      background: PRIMARY_COLORS.background,
      primary: PRIMARY_COLORS.primary,
      surface: PRIMARY_COLORS.surface,
    },
    borders: {
      colors: {
        primary: PRIMARY_COLORS.border,
        surface: PRIMARY_COLORS.border,
      },
      radius: [4, 8, 12, 16, 24],
      widths: [0, 1, 2],
    },
    colors: {
      background: PRIMARY_COLORS.background,
      border: PRIMARY_COLORS.border,
      error: PRIMARY_COLORS.error,
      primary: PRIMARY_COLORS.primary,
      secondary: PRIMARY_COLORS.secondary,
      success: PRIMARY_COLORS.success,
      surface: PRIMARY_COLORS.surface,
      text: PRIMARY_COLORS.text.primary,
      textSecondary: PRIMARY_COLORS.text.secondary,
    },
    fonts: {
      colors: {
        muted: PRIMARY_COLORS.text.muted,
        primary: PRIMARY_COLORS.text.primary,
        secondary: PRIMARY_COLORS.text.secondary,
      },
      sizes: [12, 14, 16, 18, 20, 24, 32],
    },
    gutters: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48],
    navigationColors: {
      background: PRIMARY_COLORS.background,
      border: PRIMARY_COLORS.border,
      card: PRIMARY_COLORS.surface,
      notification: PRIMARY_COLORS.error,
      primary: PRIMARY_COLORS.primary,
      text: PRIMARY_COLORS.text.primary,
    },
    variants: {
      dark: {},
      default: {},
    },
  };

  return themeConfig;
};

export default generateConfig;
