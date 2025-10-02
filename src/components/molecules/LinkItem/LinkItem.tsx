import type { Link } from '../../../types/link.types';

import { openLink } from '@/utils/linkOpener';
import { Check, Copy } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Animated, Clipboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useBackgroundDataLoader } from '@/hooks/useBackgroundDataLoader';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';
import { LinkThumbnail, SwipeableCard } from '@/components/molecules';
import { Text } from '@/components/ui';

type LinkItemProps = {
  readonly link: Link;
  readonly onAction?: (actionType: string, id: string) => void;
  readonly onPress?: (link: Link) => void;
}

const LINK_ACTIONS = {
  COPY_LINK: "COPY_LINK",
  DELETE: "DELETE",
  EDIT: "EDIT",
  TOGGLE_FAVORITE: "TOGGLE_FAVORITE",
} as const;

export function LinkItem({ link, onAction, onPress }: LinkItemProps) {
  const { colors } = useTheme();
  const { collections } = useCollectionsStore();
  const { tags } = useTagsStore();
  const { hasCollections, hasTags, isLoadingCollections } = useBackgroundDataLoader();
  const [showCopied, setShowCopied] = useState(false);
  const copyAnimationReference = React.useRef(new Animated.Value(0));

  const collection = collections.find(c => String(c.id) === String(link.collection_id));
  
  // Try both string and number matching for tags
  const linkTags = tags.filter(tag => 
    link.tag_ids.includes(String(tag.id)) || link.tag_ids.includes(tag.id)
  );
  
  // Determine if we should show placeholders
  const shouldShowCollectionPlaceholder = link.collection_id && !collection && (!hasCollections || isLoadingCollections);
  const shouldShowTagPlaceholders = link.tag_ids.length > 0 && linkTags.length === 0 && !hasTags;

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
      return { color: '#FF0000', name: 'fire' as const };
    }
    if (domain.includes('github')) {
      return { color: '#333333', name: 'link' as const };
    }
    if (domain.includes('twitter') || domain.includes('x.com')) {
      return { color: '#1DA1F2', name: 'link' as const };
    }
    return { color: '#10B981', name: 'link' as const };
  };

  // Get tag colors to match web app design
  const getTagGradient = (tagColor?: string) => {
    const colorMap: Record<string, { colors: string[], textColor: string }> = {
      blue: { colors: ['#DBEAFE'], textColor: '#2563EB' },
      gray: { colors: ['#F3F4F6'], textColor: '#6B7280' },
      green: { colors: ['#D1FAE5'], textColor: '#059669' },
      orange: { colors: ['#FED7AA'], textColor: '#EA580C' },
      pink: { colors: ['#FCE7F3'], textColor: '#EC4899' },
      purple: { colors: ['#E9D5FF'], textColor: '#9333EA' },
      red: { colors: ['#FEE2E2'], textColor: '#DC2626' },
      yellow: { colors: ['#FEF3C7'], textColor: '#D97706' },
    };
    
    return colorMap[tagColor || 'gray'] || colorMap.gray;
  };

  const handleOpenLink = async () => {
    await openLink(link.url);
  };

  const handleDelete = async () => {
    if (!onAction) return;
    
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this link?',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: async () => {
            try {
              await onAction(LINK_ACTIONS.DELETE, link.id);
            } catch (error) {
              console.error('Failed to delete link:', error);
            }
          },
          style: 'destructive',
          text: 'Delete'
        }
      ]
    );
  };

  const handleCopyLink = async () => {
    try {
      // Copy URL to clipboard
      await Clipboard.setString(link.url);
      console.log('Copied URL to clipboard:', link.url);
      
      // Show copied state with animation
      setShowCopied(true);
      
      // Animate scale and fade
      Animated.sequence([
        Animated.timing(copyAnimationReference.current, {
          duration: 200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(copyAnimationReference.current, {
          duration: 200,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowCopied(false);
      });
      
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
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
    <SwipeableCard
      onEdit={handleEdit}
      onDelete={handleDelete}
    >
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
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradientBackground}
      />


      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Top Row: Thumbnail and Content */}
        <View style={styles.contentRow}>
          {/* Left: Thumbnail and Time */}
          <TouchableOpacity 
            activeOpacity={0.85}
            onPress={handleOpenLink}
            style={styles.thumbnailContainer}
          >
            <LinkThumbnail
              faviconUrl={link.favicon_url}
              size="md"
              title={link.title}
              url={link.url.startsWith('http') ? link.url : `https://${link.url}`}
            />
            <Text style={[styles.timeAgo, { color: colors.text.tertiary, marginTop: 4 }]}>
              {getTimeAgo(link.created_at)}
            </Text>
          </TouchableOpacity>

          {/* Right: Content */}
          <View style={styles.content}>
            {/* Title */}
            <TouchableOpacity 
              activeOpacity={0.85}
              onPress={handleOpenLink}
            >
              <Text 
                numberOfLines={2} 
                style={[styles.title, { color: colors.text.primary }]}
              >
                {link.title}
              </Text>
            </TouchableOpacity>

            {/* Summary */}
            {link.summary ? <View style={styles.summaryContainer}>
                <Text 
                  numberOfLines={2}
                  style={[styles.summary, { color: colors.text.secondary }]}
                >
                  {link.summary}
                </Text>
              </View> : null}

            {/* Notes */}
            {link.notes ? <View style={styles.notesContainer}>
                <Text style={[styles.notesLabel, { color: colors.text.tertiary }]}>
                  NOTES
                </Text>
                <Text 
                  numberOfLines={3}
                  style={[styles.notes, { color: colors.text.secondary }]}
                >
                  {link.notes}
                </Text>
              </View> : null}

            {/* Collection and Tags Row */}
            {(collection || linkTags.length > 0 || shouldShowCollectionPlaceholder || shouldShowTagPlaceholders) ? <View style={styles.badgesRow}>
                {/* Collection */}
                {collection ? <View style={[styles.collectionBadge, { backgroundColor: '#DBEAFE' }]}>
                    <IconByVariant
                      color="#3B82F6"
                      name="collection"
                      size={10}
                    />
                    <Text style={[styles.collectionText, { color: '#3B82F6' }]}>
                      {collection.name}
                    </Text>
                  </View> : null}
                
                {/* Collection Placeholder */}
                {shouldShowCollectionPlaceholder ? <View style={[styles.collectionBadge, { backgroundColor: colors.background.subtle }]}>
                    <IconByVariant
                      color={colors.text.tertiary}
                      name="collection"
                      size={10}
                    />
                    <Text style={[styles.collectionText, { color: colors.text.tertiary }]}>
                      Loading...
                    </Text>
                  </View> : null}

                {/* Tags */}
                {linkTags.slice(0, 3).map(tag => {
                  const tagGradient = getTagGradient(tag.color);
                  return (
                    <View
                      key={tag.id}
                      style={styles.tagBadge}
                    >
                      <Text style={[styles.tagHash, { color: tagGradient.textColor }]}>
                        #
                      </Text>
                      <Text style={[styles.tagText, { color: tagGradient.textColor }]}>
                        {tag.name}
                      </Text>
                    </View>
                  );
                })}
                
                {/* Tag Placeholders */}
                {shouldShowTagPlaceholders ? link.tag_ids.slice(0, 3).map((_, index) => (
                    <View
                      key={`placeholder-${index}`}
                      style={[styles.tagBadge, { backgroundColor: colors.background.subtle }]}
                    >
                      <Text style={[styles.tagHash, { color: colors.text.tertiary }]}>
                        #
                      </Text>
                      <Text style={[styles.tagText, { color: colors.text.tertiary }]}>
                        ...
                      </Text>
                    </View>
                  )) : null}
                
                {linkTags.length > 3 && (
                  <View style={[styles.moreTagsBadge, { backgroundColor: colors.background.subtle }]}>
                    <Text style={[styles.moreTagsText, { color: colors.text.tertiary }]}>
                      +{linkTags.length - 3}
                    </Text>
                  </View>
                )}
                
                {/* Show placeholder for additional tags if we have more tag_ids than visible tags */}
                {shouldShowTagPlaceholders && link.tag_ids.length > 3 ? <View style={[styles.moreTagsBadge, { backgroundColor: colors.background.subtle }]}>
                    <Text style={[styles.moreTagsText, { color: colors.text.tertiary }]}>
                      +{link.tag_ids.length - 3}
                    </Text>
                  </View> : null}
              </View> : null}
          </View>
        </View>

        {/* Bottom Row: Action Buttons */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border.primary }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleFavorite}
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
          >
            <IconByVariant
              color={link.is_favorite ? "#FFD700" : colors.text.tertiary}
              name={link.is_favorite ? "star" : "star-outline"}
              size={18}
            />
          </TouchableOpacity>

          <View style={styles.copyButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyLink}
              style={[styles.actionButton, { backgroundColor: 'transparent' }]}
            >
              {showCopied ? (
                <Animated.View
                  style={{
                    opacity: copyAnimationReference.current,
                    transform: [
                      {
                        scale: copyAnimationReference.current.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  }}
                >
                  <Check color="#10B981" size={18} />
                </Animated.View>
              ) : (
                <Copy color={colors.text.tertiary} size={18} />
              )}
            </TouchableOpacity>
            {showCopied ? <Animated.Text
                style={[
                  styles.copiedText,
                  {
                    opacity: copyAnimationReference.current,
                  },
                ]}
              >
                Copied!
              </Animated.Text> : null}
          </View>
          
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleEdit}
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
          >
            <IconByVariant color={colors.text.tertiary} name="edit" size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDelete}
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
          >
            <IconByVariant 
              color="#EF4444" 
              name="trash" 
              size={18} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </SwipeableCard>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 0,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  actionsRow: {
    alignItems: 'center',
    borderTopWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  collectionBadge: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  collectionText: {
    fontSize: 10,
    fontWeight: '500',
  },
  container: {
    borderRadius: 12,
    borderWidth: 0.5,
    elevation: 3,
    marginHorizontal: SPACING.md,
    marginVertical: 6,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  contentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.xs,
    padding: SPACING.xs,
  },
  copiedText: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 4,
    color: '#000000',
    elevation: 5,
    fontSize: 10,
    fontWeight: '600',
    left: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    right: -8,
    textAlign: 'center',
    top: -25,
    zIndex: 1000,
  },
  copyButtonContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  mainContent: {
    flex: 1,
  },
  moreTagsBadge: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreTagsText: {
    fontSize: 11,
    fontWeight: '500',
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 18,
    opacity: 0.75,
  },
  notesContainer: {
    marginBottom: SPACING.xs,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  summary: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    opacity: 0.85,
  },
  summaryContainer: {
    marginBottom: 4,
  },
  tagBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  tagHash: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  thumbnailContainer: {
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 24,
    padding: 4,
  },
  timeAgo: {
    fontSize: 10,
    fontWeight: '400',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 20,
    marginBottom: 4,
  },
}); 