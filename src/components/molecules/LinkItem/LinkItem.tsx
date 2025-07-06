import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';
import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { IconByVariant } from '@/components/atoms';
import type { Link } from '../../../types/link.types';

interface LinkItemProps {
  link: Link;
  onPress?: (link: Link) => void;
  onAction?: (actionType: string, id: string) => void;
}

export function LinkItem({ link, onPress, onAction }: LinkItemProps) {
  const { colors } = useTheme();
  const { collections } = useCollectionsStore();
  const { tags } = useTagsStore();

  const collection = collections.find(c => String(c.id) === link.collection_id);
  const linkTags = tags.filter(tag => link.tag_ids.includes(String(tag.id)));

  // Format the time difference
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  return (
    <Pressable
      onPress={() => onPress?.(link)}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <View style={styles.urlRow}>
        <Text 
          variant="caption"
          style={{ color: colors.text.tertiary, opacity: 0.7 }}
        >
          {getDomain(link.url)} • {getTimeAgo(link.created_at)}
        </Text>
      </View>

      <Text 
        variant="title" 
        weight="bold"
        style={[styles.title, { color: colors.text.primary }]}
        numberOfLines={2}
      >
        {link.title}
      </Text>

      {link.summary && (
        <Text 
          variant="body"
          style={[styles.summary, { color: colors.text.secondary }]}
          numberOfLines={2}
        >
          {link.summary}
        </Text>
      )}

      <View style={styles.tagsRow}>
        {/* Collection Tag */}
        {collection && (
          <View
            style={[
              styles.tag,
              styles.collectionTag,
              { 
                backgroundColor: `${colors.accent.primary}15`,
                borderColor: `${colors.accent.primary}30`,
              }
            ]}
          >
            <IconByVariant
              name="collection"
              size={12}
              color={colors.accent.primary}
              style={styles.tagIcon}
            />
            <Text
              variant="caption"
              style={{ color: colors.accent.primary }}
            >
              {collection.name}
            </Text>
          </View>
        )}

        {/* Regular Tags */}
        {linkTags.map(tag => (
          <View
            key={tag.id}
            style={[
              styles.tag,
              { 
                backgroundColor: colors.background.subtle,
                borderColor: colors.border.primary,
              }
            ]}
          >
            <Text
              variant="caption"
              style={{ color: colors.text.tertiary }}
            >
              # {tag.name}
            </Text>
          </View>
        ))}
      </View>

      {(link.is_favorite || link.is_read) && (
        <View style={styles.indicators}>
          {link.is_favorite && (
            <IconByVariant
              name="fire"
              size={14}
              color={colors.accent.primary}
              style={styles.indicator}
            />
          )}
          {link.is_read && (
            <Text 
              variant="caption"
              style={[styles.indicator, { color: colors.text.tertiary }]}
            >
              Read
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    marginBottom: SPACING.sm,
    fontSize: 24,
    lineHeight: 32,
  },
  summary: {
    marginBottom: SPACING.md,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagIcon: {
    marginRight: SPACING.xxs,
  },
  collectionTag: {
    borderWidth: 1,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  indicator: {
    opacity: 0.7,
  },
}); 