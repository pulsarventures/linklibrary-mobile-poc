import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { IconByVariant } from '@/components/atoms';
import { SPACING } from '@/theme/styles/spacing';

type StatusType = 'success' | 'error' | 'warning';

type StatusIndicatorProps = {
  type: StatusType;
  message: string;
  style?: ViewStyle;
};

const STATUS_CONFIG = {
  success: {
    icon: 'check',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10B981'
  },
  error: {
    icon: 'x',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444'
  },
  warning: {
    icon: 'alert-triangle',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#F59E0B'
  }
} as const;

export function StatusIndicator({ type, message, style }: StatusIndicatorProps) {
  const { colors } = useTheme();
  const config = STATUS_CONFIG[type];

  const getIconByStatus = (status: StatusType) => {
    switch (status) {
      case 'success':
        return 'check';
      case 'error':
        return 'fire';
      case 'warning':
        return 'fire';
      default:
        return 'check';
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.backgroundColor },
      style
    ]}>
      <IconByVariant 
        name={getIconByStatus(type)} 
        size={16} 
        color={config.color}
        style={styles.icon} 
      />
      <Text style={[styles.text, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 