import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { PRIMARY_COLORS } from '@/theme/styles/colors';
import { createGradientStyle } from '@/theme/styles/gradients';
import { SPACING } from '@/theme/styles/spacing';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

type ButtonProps = {
  readonly children: React.ReactNode;
  readonly disabled?: boolean;
  readonly icon?: React.ReactNode;
  readonly loading?: boolean;
  readonly onPress: () => void;
  readonly style?: any;
  readonly variant?: ButtonVariant;
}

type ButtonVariant = 'apple' | 'danger' | 'google' | 'gradient' | 'primary' | 'social';

export function Button({
  children,
  disabled = false,
  icon,
  loading = false,
  onPress,
  style,
  variant = 'primary',
}: ButtonProps) {
  const { colors } = useTheme();
  
  const getTextColor = () => {
    if (variant === 'google') return colors.text.primary;
    if (variant === 'apple') return colors.text.inverse;
    if (variant === 'danger') return colors.text.inverse;
    if (variant === 'primary') return colors.text.inverse;
    if (variant === 'gradient') return colors.text.inverse;
    return colors.text.primary;
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text 
            numberOfLines={1}
            style={[
              styles.text,
              { color: getTextColor() },
              variant === 'social' && styles.socialText
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </View>
  );

  // Gradient button
  if (variant === 'gradient') {
    const gradientConfig = createGradientStyle('primary');
    
    return (
      <TouchableOpacity
        activeOpacity={disabled || loading ? 1 : 0.8}
        disabled={disabled || loading}
        onPress={onPress}
        style={[styles.container, style]}
      >
        <LinearGradient
          colors={gradientConfig.colors}
          end={gradientConfig.end}
          start={gradientConfig.start}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Danger button with gradient
  if (variant === 'danger') {
    return (
      <TouchableOpacity
        activeOpacity={disabled || loading ? 1 : 0.8}
        disabled={disabled || loading}
        onPress={onPress}
        style={[styles.container, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={disabled ? [colors.text.tertiary, colors.text.tertiary] : [colors.error, colors.error]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Primary button with gradient
  if (variant === 'primary') {
    const gradientConfig = createGradientStyle(disabled ? 'disabled' : 'primary');
    
    return (
      <TouchableOpacity
        activeOpacity={disabled || loading ? 1 : 0.8}
        disabled={disabled || loading}
        onPress={onPress}
        style={[styles.container, style]}
      >
        <LinearGradient
          colors={gradientConfig.colors}
          end={gradientConfig.end}
          start={gradientConfig.start}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Google button
  if (variant === 'google') {
    return (
      <TouchableOpacity
        activeOpacity={disabled || loading ? 1 : 0.8}
        disabled={disabled || loading}
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor: colors.background.primary,
            borderColor: colors.border.primary,
          },
          styles.socialButton,
          disabled && styles.disabled,
          style
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Apple button with gradient
  if (variant === 'apple') {
    const gradientConfig = createGradientStyle('apple');
    
    return (
      <TouchableOpacity
        activeOpacity={disabled || loading ? 1 : 0.8}
        disabled={disabled || loading}
        onPress={onPress}
        style={[styles.container, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={gradientConfig.colors}
          end={gradientConfig.end}
          start={gradientConfig.start}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Fallback social button
  return (
    <TouchableOpacity
      activeOpacity={disabled || loading ? 1 : 0.8}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
          borderColor: colors.border.primary,
        },
        styles.socialButton,
        disabled && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  socialButton: {
    borderWidth: 1,
    elevation: 2,
    paddingHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  socialText: {
    fontWeight: '500',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});