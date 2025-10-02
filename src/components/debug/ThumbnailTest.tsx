import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { LinkThumbnail } from '@/components/molecules';

export function ThumbnailTest() {
  const { colors } = useTheme();

  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://blog.openai.com/sora-first-impressions',
    'https://github.com/facebook/react',
    'https://twitter.com/elonmusk',
    'https://www.google.com',
    'https://stackoverflow.com',
    'https://medium.com/article',
    'https://reddit.com/r/programming',
    'https://linkedin.com/in/profile',
    'https://facebook.com/profile',
    'https://x.com/profile',
  ];

  const testUrlsWithoutProtocol = [
    'youtube.com/watch?v=dQw4w9WgXcQ',
    'blog.openai.com/sora-first-impressions',
    'github.com/facebook/react',
    'twitter.com/elonmusk',
    'google.com',
    'stackoverflow.com',
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        LinkThumbnail Test
      </Text>
      
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        URLs with Protocol
      </Text>
      {testUrls.map((url, index) => (
        <View key={index} style={styles.testItem}>
          <Text style={[styles.url, { color: colors.text.secondary }]}>
            {url}
          </Text>
          <View style={styles.thumbnailContainer}>
            <LinkThumbnail
              size="lg"
              url={url}
            />
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        URLs without Protocol
      </Text>
      {testUrlsWithoutProtocol.map((url, index) => (
        <View key={index} style={styles.testItem}>
          <Text style={[styles.url, { color: colors.text.secondary }]}>
            {url}
          </Text>
          <View style={styles.thumbnailContainer}>
            <LinkThumbnail
              size="lg"
              url={`https://${url}`}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  testItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 20,
    padding: 15,
  },
  thumbnailContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  url: {
    fontSize: 12,
    marginBottom: 10,
  },
}); 