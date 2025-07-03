export * from './colors';
export * from './typography';
export * from './spacing';
export * from './components';

import { PRIMARY_COLORS } from './colors';
import { BUTTON_STYLES, INPUT_STYLES, LAYOUT_STYLES } from './components';
import { SPACING } from './spacing';
import { TYPOGRAPHY } from './typography';

export const theme = {
  colors: PRIMARY_COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  components: {
    button: BUTTON_STYLES,
    input: INPUT_STYLES,
    layout: LAYOUT_STYLES
  }
} as const;

export type Theme = typeof theme; 