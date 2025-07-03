import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';
import { PRIMARY_COLORS, TYPOGRAPHY } from '@/theme/styles';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface CustomTextProps extends TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  weight = 'regular',
  color = PRIMARY_COLORS.text.primary,
  style,
  children,
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
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    lineHeight: TYPOGRAPHY.sizes.xl * TYPOGRAPHY.lineHeights.tight,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    lineHeight: TYPOGRAPHY.sizes.lg * TYPOGRAPHY.lineHeights.normal,
  },
  body: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: TYPOGRAPHY.sizes.md * TYPOGRAPHY.lineHeights.normal,
  },
  caption: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal,
  },
  // Weights
  regular: {
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  medium: {
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  semibold: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  bold: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
}); 