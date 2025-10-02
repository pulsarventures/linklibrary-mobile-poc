import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { createGradientStyle } from '@/theme/styles/gradients';
import { SPACING } from '@/theme/styles/spacing';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

// Animated dots component with proper cleanup
const AnimatedDots = ({ color }: { color: string }) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Reset values to initial state
    dot1.setValue(0.3);
    dot2.setValue(0.3);
    dot3.setValue(0.3);

    const createAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    animationRef.current = Animated.parallel([
      createAnimation(dot1, 0),
      createAnimation(dot2, 200),
      createAnimation(dot3, 400),
    ]);

    animationRef.current.start();

    // Cleanup function to stop animations when component unmounts
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  return (
    <View style={styles.dotsContainer}>
      <Animated.Text style={[styles.dots, { color, opacity: dot1 }]}>●</Animated.Text>
      <Animated.Text style={[styles.dots, { color, opacity: dot2 }]}>●</Animated.Text>
      <Animated.Text style={[styles.dots, { color, opacity: dot3 }]}>●</Animated.Text>
    </View>
  );
};


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
  const { colors, isDark } = useTheme();
  
  const getTextColor = () => {
    if (variant === 'google') return colors.text.primary;
    if (variant === 'apple') return colors.text.inverse;
    if (variant === 'danger') return colors.text.inverse;
    if (variant === 'primary') return '#ffffff'; // Always white text for good contrast
    if (variant === 'gradient') return '#ffffff'; // Always white text for good contrast
    return colors.text.primary;
  };

  const renderContent = () => (
      <View style={styles.contentContainer}>
        {loading ? (
          <AnimatedDots color={getTextColor()} />
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
    const gradientConfig = createGradientStyle('primary', isDark);
    
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
    const gradientConfig = createGradientStyle('primary', isDark);
    
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
    const gradientConfig = createGradientStyle('apple', isDark);
    
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
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    fontSize: 10,
    marginHorizontal: 3,
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