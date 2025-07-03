import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Text } from './Text';
import { PRIMARY_COLORS } from '@/theme/styles/colors';
import { SPACING } from '@/theme/styles/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  icon,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" weight="medium" style={styles.label}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={PRIMARY_COLORS.text.secondary}
          {...props}
        />
      </View>
      {error && (
        <Text variant="caption" color={PRIMARY_COLORS.error} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.xs,
    color: PRIMARY_COLORS.text.primary,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    backgroundColor: PRIMARY_COLORS.surface,
    borderWidth: 1,
    borderColor: PRIMARY_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingLeft: 48, // Space for icon
    color: PRIMARY_COLORS.text.primary,
    fontSize: 16,
  },
  inputError: {
    borderColor: PRIMARY_COLORS.error,
  },
  icon: {
    position: 'absolute',
    left: SPACING.md,
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  error: {
    marginTop: SPACING.xs,
  },
}); 