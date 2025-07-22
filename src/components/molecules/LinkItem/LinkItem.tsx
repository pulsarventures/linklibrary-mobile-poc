import type { Link } from '../../../types/link.types';

import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';
import { LinkThumbnail } from '@/components/molecules';
import { Text } from '@/components/ui';

type LinkItemProps = {
  readonly link: Link;
  readonly onAction?: (actionType: string, id: string) => void;
  readonly onPress?: (link: Link) => void;
}

const LINK_ACTIONS = {
  EDIT: "EDIT",
  DELETE: "DELETE",
  TOGGLE_FAVORITE: "TOGGLE_FAVORITE",
  COPY_LINK: "COPY_LINK",
} as const;

export function LinkItem({ link, onAction, onPress }: LinkItemProps) {
  const { colors } = useTheme();
  const { collections } = useCollectionsStore();
  const { tags } = useTagsStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const collection = collections.find(c => String(c.id) === link.collection_id);
  const linkTags = tags.filter(tag => link.tag_ids.includes(String(tag.id)));

  // Format the time difference
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86_400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86_400)}d ago`;
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

  // Get content type icon based on domain
  const getContentTypeIcon = () => {
    const domain = getDomain(link.url).toLowerCase();
    if (domain.includes('youtube') || domain.includes('youtu.be')) {
      return { name: 'fire' as const, color: '#FF0000' };
    }
    if (domain.includes('github')) {
      return { name: 'link' as const, color: '#333333' };
    }
    if (domain.includes('twitter') || domain.includes('x.com')) {
      return { name: 'link' as const, color: '#1DA1F2' };
    }
    return { name: 'link' as const, color: '#10B981' };
  };

  // Get tag colors for gradient backgrounds
  const getTagGradient = (tagColor?: string) => {
    const colorMap: Record<string, { colors: string[], textColor: string }> = {
      red: { colors: ['#FEE2E2', '#FECACA'], textColor: '#991B1B' },
      blue: { colors: ['#DBEAFE', '#BFDBFE'], textColor: '#1E40AF' },
      green: { colors: ['#D1FAE5', '#A7F3D0'], textColor: '#065F46' },
      yellow: { colors: ['#FEF3C7', '#FDE68A'], textColor: '#92400E' },
      purple: { colors: ['#EDE9FE', '#DDD6FE'], textColor: '#5B21B6' },
      pink: { colors: ['#FCE7F3', '#FBCFE8'], textColor: '#BE185D' },
      gray: { colors: ['#F3F4F6', '#E5E7EB'], textColor: '#374151' },
    };
    
    return colorMap[tagColor || 'gray'] || colorMap.gray;
  };

  const handleOpenLink = async () => {
    try {
      const url = link.url;
      
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        // Try to open the URL in the native app first, then fallback to browser
        await Linking.openURL(url);
      } else {
        // If URL can't be opened, show an error
        Alert.alert(
          'Unable to open link',
          'This link cannot be opened on your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert(
        'Error',
        'An error occurred while trying to open the link.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDelete = async () => {
    if (isDeleting || !onAction) return;
    
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await onAction(LINK_ACTIONS.DELETE, link.id);
            } catch (error) {
              console.error('Failed to delete link:', error);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleCopyLink = () => {
    // TODO: Implement copy to clipboard
    console.log('Copy link:', link.url);
  };

  const handleToggleFavorite = () => {
    if (onAction) {
      onAction(LINK_ACTIONS.TOGGLE_FAVORITE, link.id);
    }
  };

  const handleEdit = () => {
    if (onAction) {
      onAction(LINK_ACTIONS.EDIT, link.id);
    }
  };

  const contentIcon = getContentTypeIcon();

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: colors.background.secondary,
          borderColor: colors.border.primary,
        }
      ]}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.background.secondary, `${colors.background.primary}E0`]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Favorite Star Corner */}
      <View style={styles.favoriteCorner}>
        <TouchableOpacity
          onPress={handleToggleFavorite}
          style={styles.favoriteButton}
        >
          <IconByVariant
            name="star"
            size={18}
            color={link.is_favorite ? "#FFD700" : "#D1D5DB"}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content Row */}
      <View style={styles.contentRow}>
        {/* Left: Thumbnail and Time */}
        <View style={styles.thumbnailContainer}>
          <LinkThumbnail
            url={link.url.startsWith('http') ? link.url : `https://${link.url}`}
            faviconUrl={link.favicon_url}
            title={link.title}
            size="md"
          />
          <Text style={[styles.timeAgo, { color: colors.text.tertiary, marginTop: 4 }]}>
            {getTimeAgo(link.created_at)}
          </Text>
        </View>

        {/* Center: Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text 
            numberOfLines={2} 
            style={[styles.title, { color: colors.text.primary }]}
          >
            {link.title}
          </Text>

          {/* Summary */}
          {link.summary && (
            <View style={styles.summaryContainer}>
              <Text 
                numberOfLines={2}
                style={[styles.summary, { color: colors.text.secondary }]}
              >
                {link.summary}
              </Text>
            </View>
          )}

          {/* Notes */}
          {link.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: colors.text.tertiary }]}>
                NOTES
              </Text>
              <Text 
                numberOfLines={3}
                style={[styles.notes, { color: colors.text.secondary }]}
              >
                {link.notes}
              </Text>
            </View>
          )}

          {/* Collection and Tags Row */}
          <View style={styles.badgesRow}>
            {/* Collection */}
            {collection && (
              <LinearGradient
                colors={['#3B82F615', '#1D4ED820']}
                style={styles.collectionBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconByVariant
                  name="collection"
                  size={10}
                  color="#3B82F6"
                />
                <Text style={[styles.collectionText, { color: '#3B82F6' }]}>
                  {collection.name}
                </Text>
              </LinearGradient>
            )}

            {/* Tags */}
            {linkTags.slice(0, 2).map(tag => {
              const tagGradient = getTagGradient(tag.color);
              return (
                <LinearGradient
                  key={tag.id}
                  colors={tagGradient.colors}
                  style={styles.tagBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconByVariant
                    name="hash"
                    size={8}
                    color={tagGradient.textColor}
                  />
                  <Text style={[styles.tagText, { color: tagGradient.textColor }]}>
                    {tag.name}
                  </Text>
                </LinearGradient>
              );
            })}
            
            {linkTags.length > 2 && (
              <View style={[styles.moreTagsBadge, { backgroundColor: colors.background.subtle }]}>
                <Text style={[styles.moreTagsText, { color: colors.text.tertiary }]}>
                  +{linkTags.length - 2}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right: Action Buttons */}
        <View style={styles.actionsColumn}>
          <TouchableOpacity
            onPress={handleOpenLink}
            style={[styles.actionButton, { backgroundColor: `${colors.background.primary}90` }]}
          >
            <IconByVariant name="external" size={14} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCopyLink}
            style={[styles.actionButton, { backgroundColor: `${colors.background.primary}90` }]}
          >
            <IconByVariant name="link" size={14} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleEdit}
            style={[styles.actionButton, { backgroundColor: `${colors.background.primary}90` }]}
          >
            <IconByVariant name="edit" size={14} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, { backgroundColor: `${colors.background.primary}90` }]}
            disabled={isDeleting}
          >
            <IconByVariant 
              name="trash" 
              size={14} 
              color={isDeleting ? colors.text.tertiary : "#EF4444"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  favoriteCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    zIndex: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 4,
  },
  contentRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  content: {
    flex: 1,
    gap: SPACING.xs,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  summaryContainer: {
    marginBottom: SPACING.xs,
  },
  summary: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 2,
  },
  collectionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreTagsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreTagsText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsColumn: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timeAgo: {
    fontSize: 10,
    fontWeight: '400',
    marginBottom: 4,
  },
  thumbnailContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  notesContainer: {
    marginBottom: SPACING.xs,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  notes: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
}); 