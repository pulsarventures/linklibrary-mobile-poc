import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PRIMARY_COLORS } from '@/theme/styles/colors';
import { SPACING } from '@/theme/styles/spacing';
import { createGradientStyle } from '@/theme/styles/gradients';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

type ButtonVariant = 'primary' | 'social' | 'google' | 'apple' | 'danger' | 'gradient';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: any;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
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
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text 
            style={[
              styles.text,
              { color: getTextColor() },
              variant === 'social' && styles.socialText
            ]}
            numberOfLines={1}
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
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={disabled || loading ? 1 : 0.8}
        style={[styles.container, style]}
      >
        <LinearGradient
          colors={gradientConfig.colors}
          start={gradientConfig.start}
          end={gradientConfig.end}
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
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={disabled || loading ? 1 : 0.8}
        style={[styles.container, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={disabled ? [colors.text.tertiary, colors.text.tertiary] : [colors.error, colors.error]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={disabled || loading ? 1 : 0.8}
        style={[styles.container, style]}
      >
        <LinearGradient
          colors={gradientConfig.colors}
          start={gradientConfig.start}
          end={gradientConfig.end}
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
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={disabled || loading ? 1 : 0.8}
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
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={disabled || loading ? 1 : 0.8}
        style={[styles.container, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={gradientConfig.colors}
          start={gradientConfig.start}
          end={gradientConfig.end}
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
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled || loading ? 1 : 0.8}
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
    height: 48,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  socialButton: {
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  socialText: {
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});