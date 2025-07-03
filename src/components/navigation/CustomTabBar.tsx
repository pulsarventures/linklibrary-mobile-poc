import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '@/components/ui/Text';
import { PRIMARY_COLORS } from '@/theme/styles/colors';
import { SPACING } from '@/theme/styles/spacing';
import { IconByVariant } from '@/components/atoms';
import type { IconName } from '@/theme/assets/icons';

const TAB_ICONS: Record<string, IconName> = {
  Links: 'link',
  Collections: 'collection',
  Tags: 'tag',
  Settings: 'settings',
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = typeof options.tabBarLabel === 'string' 
          ? options.tabBarLabel 
          : options.title 
          ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={`${label} tab`}
            onPress={onPress}
            style={styles.tab}
          >
            {isFocused ? (
              <LinearGradient
                colors={['#7C3AED', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeIndicator}
              />
            ) : null}
            <IconByVariant
              name={TAB_ICONS[route.name]}
              size={isFocused ? 24 : 22}
              color={isFocused ? PRIMARY_COLORS.primary : PRIMARY_COLORS.text.muted}
            />
            <Text
              style={[
                styles.label,
                isFocused ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: PRIMARY_COLORS.border,
    height: 84,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLORS.overlay,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  activeIndicator: {
    position: 'absolute',
    top: -1,
    left: '15%',
    right: '15%',
    height: 3,
    borderRadius: 1.5,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
  labelActive: {
    color: PRIMARY_COLORS.primary,
    fontWeight: '600',
  },
  labelInactive: {
    color: PRIMARY_COLORS.text.muted,
    fontWeight: '500',
  },
});

export default CustomTabBar; 