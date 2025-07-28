import type { Link } from '../../../types/link.types';

import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Copy, Check } from 'lucide-react-native';

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
  const [showCopied, setShowCopied] = useState(false);
  const copyAnimationRef = React.useRef(new Animated.Value(0));

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

  const handleCopyLink = async () => {
    try {
      // For now, just show the copied animation
      // The actual clipboard functionality will be implemented later
      console.log('Copying URL:', link.url);
      
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
        </View>

        {/* Bottom Row: Action Buttons */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border.primary }]}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[styles.actionButton, { backgroundColor: `${colors.background.primary}95` }]}
            activeOpacity={0.8}
          >
            <IconByVariant
              name="star"
              size={18}
              color={link.is_favorite ? "#FFD700" : colors.text.secondary}
            />
          </TouchableOpacity>

          <View style={styles.copyButtonContainer}>
            <TouchableOpacity
              onPress={handleCopyLink}
              style={[styles.actionButton, { backgroundColor: `${colors.background.primary}95` }]}
              activeOpacity={0.8}
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
                  <Check size={18} color="#000000" />
                </Animated.View>
              ) : (
                <Copy size={18} color={colors.text.secondary} />
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
            style={[styles.actionButton, { backgroundColor: `${colors.background.primary}95` }]}
            activeOpacity={0.8}
          >
            <IconByVariant name="edit" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, { backgroundColor: `${colors.background.primary}95` }]}
            disabled={isDeleting}
            activeOpacity={0.8}
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
    borderRadius: 16,
    borderWidth: 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
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
    gap: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  collectionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderTopWidth: 0.5,
    marginTop: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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