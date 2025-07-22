export * from './colors';
export * from './components';
export * from './spacing';
export * from './typography';

import { PRIMARY_COLORS } from './colors';
import { BUTTON_STYLES, INPUT_STYLES, LAYOUT_STYLES } from './components';
import { SPACING } from './spacing';
import { TYPOGRAPHY } from './typography';

export const theme = {
  colors: PRIMARY_COLORS,
  components: {
    button: BUTTON_STYLES,
    input: INPUT_STYLES,
    layout: LAYOUT_STYLES
  },
  spacing: SPACING,
  typography: TYPOGRAPHY
} as const;

export type Theme = typeof theme; 