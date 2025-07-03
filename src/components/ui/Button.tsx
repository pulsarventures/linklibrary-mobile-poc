import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PRIMARY_COLORS } from '@/theme/styles/colors';
import { SPACING } from '@/theme/styles/spacing';
import { GRADIENTS, createGradientStyle } from '@/theme/styles/gradients';

type ButtonVariant = 'primary' | 'social' | 'google' | 'apple';

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
  
  const getTextColor = () => {
    if (variant === 'google') return '#1F2937';
    if (variant === 'apple') return '#FFFFFF';
    return PRIMARY_COLORS.text.primary;
  };

  const renderContent = () => (
    <View style={[styles.contentContainer, loading && styles.loadingContainer]}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[
            styles.text,
            { color: getTextColor() },
            variant === 'social' && styles.socialText
          ]}>
            {children}
          </Text>
        </>
      )}
    </View>
  );

  // Primary button with gradient
  if (variant === 'primary') {
    const gradientConfig = createGradientStyle(disabled ? 'disabled' : 'primary');
    
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={loading ? 1 : 0.8}
          style={styles.touchable}
        >
          <LinearGradient
            colors={gradientConfig.colors}
            start={gradientConfig.start}
            end={gradientConfig.end}
            style={[styles.gradient, gradientConfig.style]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Google button with gradient
  if (variant === 'google') {
    const gradientConfig = createGradientStyle('google');
    
    return (
      <View style={[styles.container, styles.socialContainer, style]}>
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={loading ? 1 : 0.8}
          style={styles.touchable}
        >
          <LinearGradient
            colors={gradientConfig.colors}
            start={gradientConfig.start}
            end={gradientConfig.end}
            style={[styles.gradient, gradientConfig.style, styles.socialGradient]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Apple button with gradient
  if (variant === 'apple') {
    const gradientConfig = createGradientStyle('apple');
    
    return (
      <View style={[styles.container, styles.socialContainer, style]}>
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={loading ? 1 : 0.8}
          style={styles.touchable}
        >
          <LinearGradient
            colors={gradientConfig.colors}
            start={gradientConfig.start}
            end={gradientConfig.end}
            style={[styles.gradient, gradientConfig.style]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback social button (non-gradient)
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={loading ? 1 : 0.8}
      style={[
        styles.container,
        styles.social,
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
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  socialContainer: {
    flex: 1,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  touchable: {
    flex: 1,
    borderRadius: 12,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  socialGradient: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    gap: SPACING.xs,
  },
  loadingContainer: {
    position: 'relative',
    height: 24,
  },
  social: {
    backgroundColor: PRIMARY_COLORS.social?.google?.background || '#FFFFFF',
    borderWidth: 1,
    borderColor: PRIMARY_COLORS.social?.google?.border || '#E5E7EB',
    flex: 1,
    marginBottom: 0,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  socialText: {
    fontWeight: '500',
  },
  icon: {
    marginRight: 0,
  },
});