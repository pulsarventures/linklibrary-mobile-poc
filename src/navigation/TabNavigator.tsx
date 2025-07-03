import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from './types';
import Links from '@/screens/Links/Links';
import Collections from '@/screens/Collections/Collections';
import Tags from '@/screens/Tags/Tags';
import Settings from '@/screens/Settings/Settings';
import CustomTabBar from '@/components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Links"
        component={Links}
        options={{
          title: 'Links',
        }}
      />
      <Tab.Screen
        name="Collections"
        component={Collections}
        options={{
          title: 'Collections',
        }}
      />
      <Tab.Screen
        name="Tags"
        component={Tags}
        options={{
          title: 'Tags',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export default TabNavigator; 