import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import CustomTabBar from '@/components/navigation/CustomTabBar';
import { Collections, Links, Search, Settings, Tags } from '@/screens';
import AddLinkScreen from '@/screens/Add/AddLinkScreen';

import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen 
        component={Links} 
        name="Links"
        options={{ title: 'Links' }}
      />
      <Tab.Screen 
        component={Collections} 
        name="Collections"
        options={{ title: 'Collections' }}
      />
      <Tab.Screen 
        component={Search} 
        name="Search"
        options={{ title: 'Chat' }}
      />
      <Tab.Screen 
        component={Tags} 
        name="Tags"
        options={{ title: 'Tags' }}
      />
      <Tab.Screen 
        component={Settings} 
        name="Settings"
        options={{ title: 'Settings' }}
      />
      <Tab.Screen 
        component={AddLinkScreen} 
        name="Add"
        options={{ 
          tabBarButton: () => null, // Hide from tab bar but keep accessible
          title: 'Add Link',
        }}
      />
    </Tab.Navigator>
  );
} 