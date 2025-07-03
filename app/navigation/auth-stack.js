import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { screens } from '../config';
import WalkThrough from '../screens/walkthrough';
import Landing from '../screens/Landing';

const AuthStack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <AuthStack.Navigator headerMode="none" initialRouteName={screens.landing}>
      <AuthStack.Screen name={screens.landing} component={Landing} />
      <AuthStack.Screen name={screens.walkthrough} component={WalkThrough} />
    </AuthStack.Navigator>
  );
} 