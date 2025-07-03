import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COMPONENTS } from '@/theme/styles';
import { Text } from './Text';
import { IconByVariant } from '@/components/atoms';

type StatusType = 'success' | 'error' | 'warning';

type StatusIndicatorProps = {
  type: StatusType;
  message: string;
  style?: ViewStyle;
};

export function StatusIndicator({ type, message, style }: StatusIndicatorProps) {
  return (
    <View style={[styles.container, style]}>
      <IconByVariant name="check" size={16} color={COMPONENTS.connectionStatus.text.color} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...COMPONENTS.connectionStatus.container,
  },
  text: {
    ...COMPONENTS.connectionStatus.text,
  },
}); 