import type { IconName } from '@/theme/assets/icons';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SPACING } from '@/theme/styles/spacing';
import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import { Text } from '@/components/ui/Text';

const TAB_ICONS: Record<string, IconName> = {
  Collections: 'library-big',
  Links: 'link',
  Search: 'message-circle',
  Settings: 'settings',
  Tags: 'hash',
};

function CustomTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // Filter out routes that have tabBarButton: () => null (hidden tabs) or are named "Add"
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarButton !== null && route.name !== 'Add';
  });

  return (
    <View style={[
      styles.container, 
      { 
        paddingBottom: insets.bottom,
        backgroundColor: colors.background.primary,
        borderTopColor: colors.border.primary
      }
    ]}>
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
                colors={isDark ? ['#ffffff', '#a1a1aa'] : ['#000000', '#374151']}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={styles.activeIndicator}
              />
            ) : null}
            
            {isSearchTab ? (
              <LinearGradient
                colors={isDark ? ['#4a4a4a', '#2a2a2a'] : [colors.accent.primary, colors.accent.primary + 'AA']}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={styles.searchButton}
              >
                <IconByVariant
                  color={isDark ? '#ffffff' : colors.text.inverse}
                  name={TAB_ICONS[route.name] || 'message-circle'}
                  size={24}
                />
              </LinearGradient>
            ) : (
              <IconByVariant
                color={isFocused ? colors.text.primary : colors.text.tertiary}
                name={TAB_ICONS[route.name] || 'link'}
                size={isFocused ? 24 : 22}
              />
            )}
            
            {!isSearchTab && (
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.text.primary : colors.text.tertiary,
                    fontWeight: isFocused ? '600' : '500'
                  }
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
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 84,
    width: '100%',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
  searchButton: {
    alignItems: 'center',
    borderRadius: 26,
    elevation: 12,
    height: 52,
    justifyContent: 'center',
    marginTop: -26,
    shadowColor: '#000000',
    shadowOffset: {
      height: 6,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    width: 52,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: SPACING.md,
  },
});

export default CustomTabBar; 