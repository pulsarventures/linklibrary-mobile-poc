import type { PropsWithChildren } from 'react';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';

import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

type Properties = PropsWithChildren<
  {
    readonly isError?: boolean;
    readonly onResetError?: () => void;
  } & Omit<SafeAreaViewProps, 'mode'>
>;

function SafeScreen({
  children = undefined,
  isError = false,
  onResetError = undefined,
  style,
  ...props
}: Properties) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView 
      {...props} 
      mode="padding" 
      style={[
        styles.container,
        { backgroundColor: colors.background.primary },
        style
      ]}
    >
      <StatusBar
        backgroundColor={colors.background.primary}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeScreen;
