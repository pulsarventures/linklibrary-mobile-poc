// LinkLibrary Mobile App Component Examples
// Copy these to your React Native app

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './colors';

// === BUTTON COMPONENTS ===

// Sign In Button (Gradient: Blue to Orange)
export const SignInButton = ({ title, onPress, loading = false, disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.buttonContainer, disabled && styles.disabledButton]}
  >
    <LinearGradient
      colors={Colors.gradients.signIn}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientButton}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Signing in...' : title}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Sign Up Button (Gradient: Purple to Blue)
export const SignUpButton = ({ title, onPress, loading = false, disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.buttonContainer, disabled && styles.disabledButton]}
  >
    <LinearGradient
      colors={Colors.gradients.signUp}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientButton}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Creating account...' : title}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Add Link Button (Solid Orange)
export const AddLinkButton = ({ title, onPress, loading = false, disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[
      styles.primaryButton,
      { backgroundColor: Colors.light.primary },
      disabled && styles.disabledButton
    ]}
  >
    <Text style={styles.buttonText}>
      {loading ? 'Adding...' : title}
    </Text>
  </TouchableOpacity>
);

// Primary Button (Solid Orange)
export const PrimaryButton = ({ title, onPress, loading = false, disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[
      styles.primaryButton,
      { backgroundColor: Colors.light.primary },
      disabled && styles.disabledButton
    ]}
  >
    <Text style={styles.buttonText}>
      {loading ? 'Loading...' : title}
    </Text>
  </TouchableOpacity>
);

// Secondary Button
export const SecondaryButton = ({ title, onPress, disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.secondaryButton,
      { 
        backgroundColor: Colors.light.secondary,
        borderColor: Colors.light.border 
      },
      disabled && styles.disabledButton
    ]}
  >
    <Text style={[styles.secondaryButtonText, { color: Colors.light.secondaryForeground }]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// === CARD COMPONENTS ===

// Main Card Component
export const Card = ({ children, style, ...props }) => (
  <View
    style={[
      styles.card,
      { 
        backgroundColor: Colors.light.card,
        borderColor: Colors.light.border 
      },
      style
    ]}
    {...props}
  >
    {children}
  </View>
);

// Link Item Card
export const LinkItemCard = ({ title, url, onPress, ...props }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.linkCard,
      { 
        backgroundColor: Colors.light.card,
        borderColor: Colors.light.border 
      }
    ]}
    {...props}
  >
    <Text style={[styles.linkTitle, { color: Colors.light.foreground }]}>
      {title}
    </Text>
    <Text style={[styles.linkUrl, { color: Colors.light.mutedForeground }]}>
      {url}
    </Text>
  </TouchableOpacity>
);

// === INPUT COMPONENTS ===

// Text Input
export const TextInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  style,
  ...props 
}) => (
  <TextInput
    style={[
      styles.textInput,
      { 
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.input,
        color: Colors.light.foreground 
      },
      style
    ]}
    placeholder={placeholder}
    placeholderTextColor={Colors.light.mutedForeground}
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    {...props}
  />
);

// === STYLES ===

const styles = StyleSheet.create({
  // Button Styles
  buttonContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  gradientButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.light.primaryForeground,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },

  // Card Styles
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  linkCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    ...Shadows.sm,
  },
  linkTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  linkUrl: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '400',
  },

  // Input Styles
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    marginVertical: Spacing.sm,
  },
});

// === DARK MODE SUPPORT ===

// Hook for theme switching
export const useTheme = () => {
  const isDarkMode = useColorScheme() === 'dark';
  return {
    colors: isDarkMode ? Colors.dark : Colors.light,
    isDarkMode,
  };
};

// Theme-aware component wrapper
export const ThemedView = ({ children, style, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <View
      style={[
        { backgroundColor: colors.background },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// Theme-aware text component
export const ThemedText = ({ children, style, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <Text
      style={[
        { color: colors.foreground },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
