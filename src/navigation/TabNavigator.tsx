import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconByVariant } from '@/components/atoms';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';
import { Links, Collections, Tags, Settings } from '@/screens';
import AddLinkScreen from '@/screens/Add/AddLinkScreen';
import { RootTabParamList } from './types';
import { IconName } from '@/theme/assets/icons';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '@/theme/styles/spacing';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, IconName> = {
  Links: 'link',
  Collections: 'library-big',
  Add: 'add',
  Tags: 'hash',
  Settings: 'settings',
};

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          // Special styling for the Add button
          if (route.name === 'Add') {
            return (
              <View style={[styles.addButton, { backgroundColor: colors.accent.primary }]}>
                <IconByVariant
                  name={TAB_ICONS[route.name]}
                  size={24}
                  color={colors.text.inverse}
                />
              </View>
            );
          }
          return (
            <IconByVariant
              name={TAB_ICONS[route.name]}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border.primary,
        },
        // Hide label for Add button
        tabBarLabel: route.name === 'Add' ? '' : route.name,
      })}
    >
      <Tab.Screen 
        name="Links" 
        component={Links}
        options={{ title: 'Links' }}
      />
      <Tab.Screen 
        name="Collections" 
        component={Collections}
        options={{ title: 'Collections' }}
      />
      <Tab.Screen 
        name="Add" 
        component={AddLinkScreen}
        options={{ title: '' }}
      />
      <Tab.Screen 
        name="Tags" 
        component={Tags}
        options={{ title: 'Tags' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md, // Lift it up a bit
  },
}); 