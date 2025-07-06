import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING } from '@/theme/styles/spacing';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'screen';
  keyboardAvoiding?: boolean;
  scrollable?: boolean;
}

export function Container({
  children,
  variant = 'screen',
  keyboardAvoiding = false,
  scrollable = false,
  style,
  ...props
}: ContainerProps) {
  const { colors } = useTheme();

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const containerContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  if (variant === 'screen') {
    return (
      <SafeAreaView 
        style={[
          styles.screen, 
          { backgroundColor: colors.background.primary },
          style
        ]} 
        {...props}
      >
        {containerContent}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, style]} {...props}>
      {containerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: SPACING.lg,
  },
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
}); 