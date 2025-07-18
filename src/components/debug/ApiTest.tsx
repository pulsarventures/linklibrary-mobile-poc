import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useCreateLink } from '@/hooks/api/useLinks';
import { useTheme } from '@/theme';

export function ApiTest() {
  const { colors } = useTheme();
  const createLinkMutation = useCreateLink();

  const testCreateLink = async () => {
    console.log('🧪 Testing create link API...');
    
    const testData = {
      collection_id: '1',
      is_favorite: false,
      notes: 'Testing the API',
      summary: 'This is a test link',
      tag_ids: [],
      title: 'Test Link',
      url: 'https://example.com',
    };

    try {
      console.log('🧪 Calling createLinkMutation.mutateAsync with:', testData);
      const result = await createLinkMutation.mutateAsync(testData);
      console.log('🧪 ✅ Create link successful:', result);
    } catch (error) {
      console.error('🧪 ❌ Create link failed:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>API Test</Text>
      <TouchableOpacity
        onPress={testCreateLink}
        style={[styles.button, { backgroundColor: colors.accent.primary }]}
      >
        <Text style={styles.buttonText}>Test Create Link</Text>
      </TouchableOpacity>
      <Text style={[styles.status, { color: colors.text.secondary }]}>
        Status: {createLinkMutation.isPending ? 'Loading...' : createLinkMutation.isError ? 'Error' : 'Ready'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    margin: 10,
    padding: 20,
  },
  status: {
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
}); 