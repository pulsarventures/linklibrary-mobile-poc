import type { ThemeConfiguration, Variant } from '@/theme/types/config';
import { PRIMARY_COLORS } from '@/theme/styles';

const generateConfig = (variant: Variant): ThemeConfiguration => {
  const isDark = variant === 'dark';

  const themeConfig = {
    backgrounds: {
      primary: PRIMARY_COLORS.primary,
      surface: PRIMARY_COLORS.surface,
      background: PRIMARY_COLORS.background,
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
      primary: PRIMARY_COLORS.primary,
      secondary: PRIMARY_COLORS.secondary,
      success: PRIMARY_COLORS.success,
      error: PRIMARY_COLORS.error,
      background: PRIMARY_COLORS.background,
      surface: PRIMARY_COLORS.surface,
      text: PRIMARY_COLORS.text.primary,
      textSecondary: PRIMARY_COLORS.text.secondary,
      border: PRIMARY_COLORS.border,
    },
    fonts: {
      colors: {
        primary: PRIMARY_COLORS.text.primary,
        secondary: PRIMARY_COLORS.text.secondary,
        muted: PRIMARY_COLORS.text.muted,
      },
      sizes: [12, 14, 16, 18, 20, 24, 32],
    },
    gutters: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48],
    navigationColors: {
      primary: PRIMARY_COLORS.primary,
      background: PRIMARY_COLORS.background,
      card: PRIMARY_COLORS.surface,
      text: PRIMARY_COLORS.text.primary,
      border: PRIMARY_COLORS.border,
      notification: PRIMARY_COLORS.error,
    },
    variants: {
      dark: {},
      default: {},
    },
  };

  return themeConfig;
};

export default generateConfig;
