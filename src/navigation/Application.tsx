import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';

import { Landing, Login, SignUp, Startup } from '@/screens';

import { navigationRef as navigationReference, Paths } from './paths';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Application() {
  const { colors, isDark } = useTheme();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const initialized = useAuthStore(state => state.initialized);
  const isLoading = useAuthStore(state => state.isLoading);

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background.primary,
      border: colors.border.primary,
      card: colors.background.secondary,
      notification: colors.error,
      primary: colors.accent.primary,
      text: colors.text.primary,
    },
    dark: isDark,
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationReference} theme={navigationTheme}>
        <Stack.Navigator 
          screenOptions={{ 
            animation: 'fade',
            animationDuration: 200,
            headerShown: false,
          }}
        >
          {!initialized || isLoading ? (
            <Stack.Screen 
              component={Startup} 
              name={Paths.Startup}
              options={{
                animation: 'none',
              }}
            />
          ) : isAuthenticated ? (
            <Stack.Screen 
              component={TabNavigator} 
              name={Paths.Main}
              options={{
                animation: 'fade',
                animationDuration: 300,
              }}
            />
          ) : (
            <>
              <Stack.Screen 
                component={Login} 
                name={Paths.Login}
                options={{
                  animation: 'fade',
                }}
              />
              <Stack.Screen 
                component={SignUp} 
                name={Paths.SignUp}
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Application;
