import type { IconName } from '@/theme/assets/icons';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

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
        backgroundColor: colors.background.primary,
        borderTopColor: colors.border.primary,
        paddingBottom: insets.bottom
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
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: isDark ? '#3B82F6' : '#236CE2' }
                ]}
              />
            ) : null}

            {isSearchTab ? (
              <View
                style={[
                  styles.searchButton,
                  {
                    backgroundColor: colors.background.primary,
                    borderWidth: 2,
                    borderColor: colors.text.tertiary,
                    marginTop: -35
                  }
                ]}
              >
                <View
                  style={[
                    styles.searchButtonInner,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                    }
                  ]}
                >
                  <IconByVariant
                    color={colors.text.tertiary}
                    name={TAB_ICONS[route.name] || 'message-circle'}
                    size={24}
                  />
                </View>
              </View>
            ) : (
              <IconByVariant
                color={isFocused ? (isDark ? '#3B82F6' : '#236CE2') : colors.text.tertiary}
                name={TAB_ICONS[route.name] || 'link'}
                size={isFocused ? 24 : 22}
              />
            )}

            {!isSearchTab && (
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? (isDark ? '#3B82F6' : '#236CE2') : colors.text.tertiary,
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
  searchButtonInner: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
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