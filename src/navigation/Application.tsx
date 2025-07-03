import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import Login from '@/screens/Login/Login';
import SignUp from '@/screens/SignUp/SignUp';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { Paths } from './paths';

const Stack = createStackNavigator<RootStackParamList>();

function Application() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Group>
              <Stack.Screen name={Paths.Login} component={Login} />
              <Stack.Screen name={Paths.SignUp} component={SignUp} />
            </Stack.Group>
          ) : (
            <Stack.Screen name="Main" component={TabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Application;
