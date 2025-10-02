import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IconByVariant } from '@/components/atoms';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  showIcon?: boolean;
  style?: any;
}

export function ErrorMessage({ 
  message, 
  type = 'error', 
  showIcon = true, 
  style 
}: ErrorMessageProps) {
  const { colors } = useTheme();

  const getIconName = () => {
    switch (type) {
      case 'warning':
        return 'alert-triangle';
      case 'info':
        return 'info';
      default:
        return 'alert-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#F59E0B'; // Amber-500
      case 'info':
        return '#3B82F6'; // Blue-500
      default:
        return '#EF4444'; // Red-500
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'rgba(245, 158, 11, 0.1)'; // Amber-500 with opacity
      case 'info':
        return 'rgba(59, 130, 246, 0.1)'; // Blue-500 with opacity
      default:
        return 'rgba(239, 68, 68, 0.1)'; // Red-500 with opacity
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return 'rgba(245, 158, 11, 0.3)'; // Amber-500 with opacity
      case 'info':
        return 'rgba(59, 130, 246, 0.3)'; // Blue-500 with opacity
      default:
        return 'rgba(239, 68, 68, 0.3)'; // Red-500 with opacity
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning':
        return '#D97706'; // Amber-600
      case 'info':
        return '#2563EB'; // Blue-600
      default:
        return '#DC2626'; // Red-600
    }
  };

  if (!message) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
      },
      style
    ]}>
      {showIcon && (
        <IconByVariant
          name={getIconName()}
          size={16}
          color={getIconColor()}
          style={styles.icon}
        />
      )}
      <Text style={[
        styles.text,
        { color: getTextColor() }
      ]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
