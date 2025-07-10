import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { Login, SignUp, Landing, Startup } from '@/screens';
import { Paths, navigationRef } from './paths';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Application() {
  const { colors, isDark } = useTheme();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const initialized = useAuthStore(state => state.initialized);
  const isLoading = useAuthStore(state => state.isLoading);

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
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade',
            animationDuration: 200,
          }}
        >
          {!initialized || isLoading ? (
            <Stack.Screen 
              name={Paths.Startup} 
              component={Startup}
              options={{
                animation: 'none',
              }}
            />
          ) : !isAuthenticated ? (
            <>
              <Stack.Screen 
                name={Paths.Login} 
                component={Login}
                options={{
                  animation: 'fade',
                }}
              />
              <Stack.Screen 
                name={Paths.SignUp} 
                component={SignUp}
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </>
          ) : (
            <Stack.Screen 
              name={Paths.Main} 
              component={TabNavigator}
              options={{
                animation: 'fade',
                animationDuration: 300,
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Application;
