import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';

import { Text } from './Text';

type StatusIndicatorProps = {
  readonly message: string;
  readonly style?: ViewStyle;
  readonly type: StatusType;
};

type StatusType = 'error' | 'success' | 'warning';

const STATUS_CONFIG = {
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
    icon: 'x'
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10B981',
    icon: 'check'
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#F59E0B',
    icon: 'alert-triangle'
  }
} as const;

export function StatusIndicator({ message, style, type }: StatusIndicatorProps) {
  const { colors } = useTheme();
  const config = STATUS_CONFIG[type];

  const getIconByStatus = (status: StatusType) => {
    switch (status) {
      case 'error': {
        return 'fire';
      }
      case 'success': {
        return 'check';
      }
      case 'warning': {
        return 'fire';
      }
      default: {
        return 'check';
      }
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.backgroundColor },
      style
    ]}>
      <IconByVariant 
        color={config.color} 
        name={getIconByStatus(type)} 
        size={16}
        style={styles.icon} 
      />
      <Text style={[styles.text, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 