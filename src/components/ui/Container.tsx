import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SPACING } from '@/theme/styles/spacing';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

type ContainerProps = {
  readonly children: React.ReactNode;
  readonly keyboardAvoiding?: boolean;
  readonly scrollable?: boolean;
  readonly variant?: 'screen';
} & ViewProps

export function Container({
  children,
  keyboardAvoiding = false,
  scrollable = false,
  style,
  variant = 'screen',
  ...props
}: ContainerProps) {
  const { colors } = useTheme();

  const content = scrollable ? (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
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
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: SPACING.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
}); 