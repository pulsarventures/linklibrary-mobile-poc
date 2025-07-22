import type { IconName } from '@/theme/assets/icons';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';
import { Text } from '@/components/ui/Text';

const TAB_ICONS: Record<string, IconName> = {
  Collections: 'library-big',
  Links: 'link',
  Search: 'search',
  Settings: 'settings',
  Tags: 'hash',
};

function CustomTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Filter out routes that have tabBarButton: () => null (hidden tabs) or are named "Add"
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarButton !== null && route.name !== 'Add';
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = typeof options.tabBarLabel === 'string' 
          ? options.tabBarLabel 
          : options.title 
          ?? route.name;
        const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);
        const isSearchTab = route.name === 'Search';

        const onPress = () => {
          const event = navigation.emit({
            canPreventDefault: true,
            target: route.key,
            type: 'tabPress',
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            accessibilityLabel={`${label} tab`}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            key={route.key}
            onPress={onPress}
            style={styles.tab}
          >
            {isFocused && !isSearchTab ? (
              <LinearGradient
                colors={['#000000', '#374151']}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={styles.activeIndicator}
              />
            ) : null}
            
            {isSearchTab ? (
              <View style={styles.searchButton}>
                <IconByVariant
                  color="#FFFFFF"
                  name={TAB_ICONS[route.name] || 'search'}
                  size={24}
                />
              </View>
            ) : (
              <IconByVariant
                color={isFocused ? '#000000' : '#8E8E93'}
                name={TAB_ICONS[route.name] || 'link'}
                size={isFocused ? 24 : 22}
              />
            )}
            
            {!isSearchTab && (
              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeIndicator: {
    borderRadius: 1.5,
    height: 3,
    left: '15%',
    position: 'absolute',
    right: '15%',
    top: -1,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E5EA',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 84,
    width: '100%',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
  labelActive: {
    color: '#000000',
    fontWeight: '600',
  },
  labelInactive: {
    color: '#8E8E93',
    fontWeight: '500',
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 24,
    elevation: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: -24,
    shadowColor: '#000000',
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: 48,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: SPACING.md,
  },
});

export default CustomTabBar; 