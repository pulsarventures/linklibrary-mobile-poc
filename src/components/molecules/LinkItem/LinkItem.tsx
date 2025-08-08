import type { Link } from '../../../types/link.types';

import React, { useState } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity, Animated, Clipboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Copy, Check } from 'lucide-react-native';

import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useBackgroundDataLoader } from '@/hooks/useBackgroundDataLoader';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';
import { LinkThumbnail } from '@/components/molecules';
import { Text } from '@/components/ui';
import { openLink } from '@/utils/linkOpener';

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
  const { isLoadingCollections, hasCollections, hasTags } = useBackgroundDataLoader();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const copyAnimationRef = React.useRef(new Animated.Value(0));

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

  // Get tag colors to match web app design
  const getTagGradient = (tagColor?: string) => {
    const colorMap: Record<string, { colors: string[], textColor: string }> = {
      red: { colors: ['#FEE2E2'], textColor: '#DC2626' },
      blue: { colors: ['#DBEAFE'], textColor: '#2563EB' },
      green: { colors: ['#D1FAE5'], textColor: '#059669' },
      yellow: { colors: ['#FEF3C7'], textColor: '#D97706' },
      purple: { colors: ['#E9D5FF'], textColor: '#9333EA' },
      pink: { colors: ['#FCE7F3'], textColor: '#EC4899' },
      orange: { colors: ['#FED7AA'], textColor: '#EA580C' },
      gray: { colors: ['#F3F4F6'], textColor: '#6B7280' },
    };
    
    return colorMap[tagColor || 'gray'] || colorMap.gray;
  };

  const handleOpenLink = async () => {
    await openLink(link.url);
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

  const handleCopyLink = async () => {
    try {
      // Copy URL to clipboard
      await Clipboard.setString(link.url);
      console.log('Copied URL to clipboard:', link.url);
      
      // Show copied state with animation
      setShowCopied(true);
      
      // Animate scale and fade
      Animated.sequence([
        Animated.timing(copyAnimationRef.current, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(copyAnimationRef.current, {
          toValue: 0,
          duration: 200,
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


      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Top Row: Thumbnail and Content */}
        <View style={styles.contentRow}>
          {/* Left: Thumbnail and Time */}
          <TouchableOpacity 
            onPress={handleOpenLink}
            style={styles.thumbnailContainer}
            activeOpacity={0.85}
          >
            <LinkThumbnail
              url={link.url.startsWith('http') ? link.url : `https://${link.url}`}
              faviconUrl={link.favicon_url}
              title={link.title}
              size="md"
            />
            <Text style={[styles.timeAgo, { color: colors.text.tertiary, marginTop: 4 }]}>
              {getTimeAgo(link.created_at)}
            </Text>
          </TouchableOpacity>

          {/* Right: Content */}
          <View style={styles.content}>
            {/* Title */}
            <TouchableOpacity 
              onPress={handleOpenLink}
              activeOpacity={0.85}
            >
              <Text 
                numberOfLines={2} 
                style={[styles.title, { color: colors.text.primary }]}
              >
                {link.title}
              </Text>
            </TouchableOpacity>

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
            {(collection || linkTags.length > 0 || shouldShowCollectionPlaceholder || shouldShowTagPlaceholders) && (
              <View style={styles.badgesRow}>
                {/* Collection */}
                {collection && (
                  <View style={[styles.collectionBadge, { backgroundColor: '#DBEAFE' }]}>
                    <IconByVariant
                      name="collection"
                      size={10}
                      color="#3B82F6"
                    />
                    <Text style={[styles.collectionText, { color: '#3B82F6' }]}>
                      {collection.name}
                    </Text>
                  </View>
                )}
                
                {/* Collection Placeholder */}
                {shouldShowCollectionPlaceholder && (
                  <View style={[styles.collectionBadge, { backgroundColor: colors.background.subtle }]}>
                    <IconByVariant
                      name="collection"
                      size={10}
                      color={colors.text.tertiary}
                    />
                    <Text style={[styles.collectionText, { color: colors.text.tertiary }]}>
                      Loading...
                    </Text>
                  </View>
                )}

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
                {shouldShowTagPlaceholders && (
                  link.tag_ids.slice(0, 3).map((_, index) => (
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
                  ))
                )}
                
                {linkTags.length > 3 && (
                  <View style={[styles.moreTagsBadge, { backgroundColor: colors.background.subtle }]}>
                    <Text style={[styles.moreTagsText, { color: colors.text.tertiary }]}>
                      +{linkTags.length - 3}
                    </Text>
                  </View>
                )}
                
                {/* Show placeholder for additional tags if we have more tag_ids than visible tags */}
                {shouldShowTagPlaceholders && link.tag_ids.length > 3 && (
                  <View style={[styles.moreTagsBadge, { backgroundColor: colors.background.subtle }]}>
                    <Text style={[styles.moreTagsText, { color: colors.text.tertiary }]}>
                      +{link.tag_ids.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Bottom Row: Action Buttons */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border.primary }]}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
            activeOpacity={0.7}
          >
            <IconByVariant
              name={link.is_favorite ? "star" : "star-outline"}
              size={18}
              color={link.is_favorite ? "#FFD700" : colors.text.tertiary}
            />
          </TouchableOpacity>

          <View style={styles.copyButtonContainer}>
            <TouchableOpacity
              onPress={handleCopyLink}
              style={[styles.actionButton, { backgroundColor: 'transparent' }]}
              activeOpacity={0.7}
            >
              {showCopied ? (
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: copyAnimationRef.current.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                    opacity: copyAnimationRef.current,
                  }}
                >
                  <Check size={18} color="#10B981" />
                </Animated.View>
              ) : (
                <Copy size={18} color={colors.text.tertiary} />
              )}
            </TouchableOpacity>
            {showCopied && (
              <Animated.Text
                style={[
                  styles.copiedText,
                  {
                    opacity: copyAnimationRef.current,
                  },
                ]}
              >
                Copied!
              </Animated.Text>
            )}
          </View>
          
          <TouchableOpacity
            onPress={handleEdit}
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
            activeOpacity={0.7}
          >
            <IconByVariant name="edit" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            <IconByVariant 
              name="trash" 
              size={18} 
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
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  mainContent: {
    flex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    padding: SPACING.xs,
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  summaryContainer: {
    marginBottom: 4,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
    fontWeight: '400',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  collectionText: {
    fontSize: 10,
    fontWeight: '500',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  moreTagsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreTagsText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopWidth: 0.5,
    marginTop: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  copyButtonContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  copiedText: {
    position: 'absolute',
    top: -25,
    left: -8,
    right: -8,
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    zIndex: 1000,
    elevation: 5,
  },
  timeAgo: {
    fontSize: 10,
    fontWeight: '400',
    marginBottom: 4,
  },
  thumbnailContainer: {
    marginTop: 24,
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
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
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
    fontWeight: '400',
    fontStyle: 'italic',
  },
}); 