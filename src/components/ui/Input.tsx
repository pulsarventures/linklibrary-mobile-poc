import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { PRIMARY_COLORS } from '@/theme/styles/colors';
import { SPACING } from '@/theme/styles/spacing';

import { Text } from './Text';

type InputProps = {
  readonly containerStyle?: ViewStyle;
  readonly error?: string;
  readonly icon?: React.ReactNode;
  readonly label?: string;
} & TextInputProps

export function Input({
  containerStyle,
  error,
  icon,
  label,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label} variant="caption" weight="medium">
          {label}
        </Text> : null}
      <View style={styles.inputContainer}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          placeholderTextColor={PRIMARY_COLORS.text.secondary}
          style={[
            styles.input,
            error && styles.inputError,
            style,
          ]}
          {...props}
        />
      </View>
      {error ? <Text color={PRIMARY_COLORS.error} style={styles.error} variant="caption">
          {error}
        </Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  error: {
    marginTop: SPACING.xs,
  },
  icon: {
    height: '100%',
    justifyContent: 'center',
    left: SPACING.md,
    position: 'absolute',
    zIndex: 1,
  },
  input: {
    backgroundColor: PRIMARY_COLORS.surface,
    borderColor: PRIMARY_COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    color: PRIMARY_COLORS.text.primary,
    fontSize: 16,
    height: 48,
    paddingHorizontal: SPACING.md,
    paddingLeft: 48, // Space for icon
  },
  inputContainer: {
    position: 'relative',
  },
  inputError: {
    borderColor: PRIMARY_COLORS.error,
  },
  label: {
    color: PRIMARY_COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
}); 