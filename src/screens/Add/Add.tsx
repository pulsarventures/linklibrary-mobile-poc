import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { SafeScreen } from '@/components/templates';

export function Add() {
  return (
    <SafeScreen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Add New Link</Text>
      </View>
    </SafeScreen>
  );
} 