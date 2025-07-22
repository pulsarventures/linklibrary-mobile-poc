import type { UnionConfiguration } from './config';

export type Colors = UnionConfiguration['colors'];

export type ThemeColors = {
  accent: {
    primary: string;
    secondary: string;
  };
  background: {
    primary: string;
    secondary: string;
    subtle: string;
    surface: string;
  };
  error: string;
  success: string;
  text: {
    error: string;
    inverse: string;
    primary: string;
    secondary: string;
    tertiary: string;
  };
}
