import type { UnionConfiguration } from './config';

export type Colors = UnionConfiguration['colors'];

export interface ThemeColors {
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    error: string;
    inverse: string;
  };
  background: {
    primary: string;
    secondary: string;
    surface: string;
    subtle: string;
  };
  accent: {
    primary: string;
    secondary: string;
  };
  success: string;
  error: string;
}
