import React from 'react';
import { View } from 'react-native';

import { SafeScreen } from '@/components/templates';
import { Text } from '@/components/ui';

export function Add() {
  return (
    <SafeScreen>
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <Text>Add New Link</Text>
      </View>
    </SafeScreen>
  );
} 