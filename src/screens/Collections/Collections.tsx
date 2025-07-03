import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeScreen } from '@/components/templates';
import { Text } from '@/components/ui/Text';
import { PRIMARY_COLORS } from '@/theme/styles/colors';

export default function Collections() {
  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Collections</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: PRIMARY_COLORS.text.primary,
    marginBottom: 16,
  },
}); 