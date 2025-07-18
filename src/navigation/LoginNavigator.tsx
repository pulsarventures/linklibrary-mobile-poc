import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { Login } from '@/screens/Login/Login';
import { SignUp } from '@/screens/SignUp/SignUp';

export type LoginStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<LoginStackParamList>();

function LoginNavigator() {
  return <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <Stack.Screen component={Login} name="Login" />
    <Stack.Screen component={SignUp} name="SignUp" />
  </Stack.Navigator>
}

export default LoginNavigator; 