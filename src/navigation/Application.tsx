import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { Login, SignUp, Landing, Startup } from '@/screens';
import { Paths } from './paths';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Application() {
  const { colors, isDark } = useTheme();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const initialized = useAuthStore(state => state.initialized);

  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.accent.primary,
      background: colors.background.primary,
      card: colors.background.secondary,
      text: colors.text.primary,
      border: colors.border.primary,
      notification: colors.error,
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!initialized ? (
            <Stack.Screen name={Paths.Startup} component={Startup} />
          ) : !isAuthenticated ? (
            <>
              <Stack.Screen name={Paths.Login} component={Login} />
              <Stack.Screen name={Paths.SignUp} component={SignUp} />
            </>
          ) : (
            <Stack.Screen name={Paths.Main} component={TabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Application;
