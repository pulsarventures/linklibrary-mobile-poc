import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';

import { PRIMARY_COLORS, TYPOGRAPHY } from '@/theme/styles';

type CustomTextProps = {
  readonly children: React.ReactNode;
  readonly color?: string;
  readonly variant?: TextVariant;
  readonly weight?: TextWeight;
} & TextProps
type TextVariant = 'body' | 'caption' | 'small' | 'subtitle' | 'title';

type TextWeight = 'bold' | 'medium' | 'regular' | 'semibold';

export function Text({
  children,
  color = PRIMARY_COLORS.text.primary,
  style,
  variant = 'body',
  weight = 'regular',
  ...props
}: CustomTextProps) {
  const textStyle = [
    styles.base,
    styles[variant],
    styles[weight],
    { color },
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  // Variants
  body: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: TYPOGRAPHY.sizes.md * TYPOGRAPHY.lineHeights.normal,
  },
  caption: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: TYPOGRAPHY.sizes.xs * TYPOGRAPHY.lineHeights.normal,
  },
  small: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    lineHeight: TYPOGRAPHY.sizes.lg * TYPOGRAPHY.lineHeights.normal,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    lineHeight: TYPOGRAPHY.sizes.xl * TYPOGRAPHY.lineHeights.tight,
  },
  // Weights
  bold: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  medium: {
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  regular: {
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  semibold: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
}); 