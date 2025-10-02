import type { RootTabParamList } from '@/navigation/types';
import type { Link } from '@/types/link.types';
import type { RouteProp } from '@react-navigation/native';

import { LinksApiService } from '@/services/api/links.service';
import { openLink } from '@/utils/linkOpener';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';

import { useDeleteLink, useInfiniteLinks, useToggleFavorite, useUpdateLink } from '@/hooks/api/useLinks';
import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useSharedUrlStore } from '@/hooks/domain/user/useSharedUrlStore';
import { useBackgroundDataLoader } from '@/hooks/useBackgroundDataLoader';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';
import { LinkForm } from '@/components/molecules/LinkForm';
import { LinkItem } from '@/components/molecules/LinkItem/LinkItem';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SafeScreen } from '@/components/templates';
import { Button, Text } from '@/components/ui';

export default function Links() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootTabParamList, 'Links'>>();
  const { collections } = useCollectionsStore();
  const { isLoading: isLoadingTags, tags } = useTagsStore();
  const { isAuthenticated, user } = useAuthStore();
  const { sharedUrl } = useSharedUrlStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize background data loading for collections and tags
  const { hasCollections, hasTags, isLoadingCollections } = useBackgroundDataLoader();
  
  // Get collection and tag filter from route params
  const { collectionId, collectionName, tagId, tagName } = route.params || {};
  const isFiltered = !!(collectionId || tagId);
  
  // Screen focus tracking
  useFocusEffect(
    useCallback(() => {
      // Track screen focus for analytics if needed
    }, [route.params])
  );

  // Use Infinite Query for links data with pagination
  const linkQueryParameters = collectionId 
    ? { collection_id: collectionId } 
    : tagId 
      ? { tag_id: tagId } // Use singular tag_id, not plural tag_ids
      : undefined;
      
  const {
    data: infiniteLinksData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch: refetchLinks
  } = useInfiniteLinks(linkQueryParameters);

  // Flatten the paginated data
  const linksData = React.useMemo(() => {
    if (!infiniteLinksData?.pages) {
      console.log('📊 LINKS SCREEN: No pages data yet');
      return [];
    }
    const items = infiniteLinksData.pages.flatMap(page => page.items);
    console.log('📊 LINKS SCREEN: Loaded', items.length, 'links');
    return items;
  }, [infiniteLinksData]);

  // Log query state
  useEffect(() => {
    console.log('📊 LINKS SCREEN: Query state:', {
      isLoading,
      hasData: !!infiniteLinksData,
      linksCount: linksData.length,
      error: error?.message,
      isAuthenticated,
      linkQueryParameters
    });
  }, [isLoading, infiniteLinksData, linksData.length, error, isAuthenticated, linkQueryParameters]);

  // Remove blocking initial data load - background loader handles this
  // Links will load via TanStack Query, collections/tags load in background

  // Force refetch when filter parameters change
  useEffect(() => {
    if (collectionId || tagId) {
      refetchLinks();
    }
  }, [collectionId, tagId, refetchLinks]);

  // Remove manual data loading - TanStack Query handles this automatically

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchLinks();
    } catch (error) {
      console.error('Failed to refresh links:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.text.primary} size="small" />
      </View>
    );
  };

  const handleLinkPress = async (link: Link) => {
    await openLink(link.url);
  };

  const handleCreateLink = () => {
    // Navigate to Add screen
    try {
      navigation.navigate('Add' as never);
      // Navigation completed
    } catch (error) {
      console.error('🔘 ❌ Navigation error:', error);
      console.error('🔘 ❌ Navigation error details:', JSON.stringify(error, null, 2));
    }
  };

  const deleteLink = useDeleteLink();
  const updateLink = useUpdateLink();
  const toggleFavoriteMutation = useToggleFavorite();
  
  // Rate limiting for delete operations
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteQueue, setDeleteQueue] = useState<string[]>([]);
  
  // Process delete queue with REAL rate limiting
  useEffect(() => {
    if (deleteQueue.length > 0 && !isDeleting) {
      const processDeleteQueue = async () => {
        setIsDeleting(true);
        
        // Process deletes one by one with 1 second delay
        for (const linkId of deleteQueue) {
          try {
            // Use mutate (not mutateAsync) to avoid waiting
            deleteLink.mutate(linkId, {
              onSuccess: () => {
                if (__DEV__) {
                  console.log(`🗑️ Deleted link: ${linkId}`);
                }
              },
              onError: (error) => {
                console.error(`Failed to delete link ${linkId}:`, error);
                Toast.show({
                  text1: 'Delete failed',
                  text2: 'Some links could not be deleted. Please try again.',
                  type: 'error',
                });
              }
            });
            
            // Wait 1 second between deletes to prevent server overload
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error processing delete for ${linkId}:`, error);
          }
        }
        
        // Clear queue and reset state
        setDeleteQueue([]);
        setIsDeleting(false);
      };
      
      processDeleteQueue();
    }
  }, [deleteQueue, isDeleting, deleteLink]);

  const handleLinkAction = async (actionType: string, linkId: string) => {
    try {
      switch (actionType) {
        case 'COPY_LINK': {
          // TODO: Implement copy functionality
          console.log('Copy link:', linkId);
          break;
        }
        case 'DELETE': {
          // Add to delete queue instead of immediate deletion
          setDeleteQueue(prev => [...prev, linkId]);
          break;
        }
        case 'EDIT': {
          const linkToEdit = linksData.find(link => link.id === linkId);
          if (linkToEdit) {
            console.log('✏️ Opening edit for link:', {
              availableCollections: collections.length || 0,
              availableTags: tags.length || 0,
              collection_id: linkToEdit.collection_id,
              id: linkToEdit.id,
              tag_ids: linkToEdit.tag_ids,
              title: linkToEdit.title
            });
            setEditingLink(linkToEdit);
          }
          break;
        }
        case 'TOGGLE_FAVORITE': {
          // Use optimistic update mutation for instant UI feedback
          toggleFavoriteMutation.mutate(linkId, {
            onError: (error) => {
              // Error toast will be shown, optimistic update is automatically reverted
              Toast.show({
                text1: 'Failed to update favorite',
                text2: error instanceof Error ? error.message : 'Please try again',
                type: 'error',
              });
            },
            // Note: No onSuccess toast needed - the visual feedback (star change) is immediate
          });
          break;
        }
        default: {
          console.log('Unknown action:', actionType);
        }
      }
    } catch (error) {
      console.error('Failed to handle link action:', error);
      Toast.show({
        text1: error instanceof Error ? error.message : 'Failed to perform action',
        type: 'error',
      });
    }
  };

  // Filter links based on search query - MUST be before any conditional returns
  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim() || !linksData) return linksData;
    
    const query = searchQuery.toLowerCase().trim();
    return linksData.filter(link => 
      link.title.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query) ||
      link.summary?.toLowerCase().includes(query) ||
      link.notes?.toLowerCase().includes(query)
    );
  }, [linksData, searchQuery]);

  // Show loading screen only on first load when we have no data
  if (isLoading && !refreshing && (!linksData || linksData.length === 0)) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator color={colors.text.primary} size="large" />
        </View>
      </SafeScreen>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <Text style={{ color: colors.text.error }}>
            Please log in to view your links
          </Text>
        </View>
      </SafeScreen>
    );
  }

  if (error) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <Text style={{ color: colors.text.error }}>
            Failed to load links. Please try again.
          </Text>
          <Button
            onPress={onRefresh}
            style={styles.retryButton}
            variant="gradient"
          >
            Retry
          </Button>
        </View>
      </SafeScreen>
    );
  }

  const handleUpdateLink = async (data: Partial<Link>) => {
    if (!editingLink) return;

    // Store the ID and current data before clearing editingLink
    const linkId = editingLink.id;
    const originalLink = editingLink;

    // Close modal immediately for better UX
    setEditingLink(null);

    // Use optimistic mutation - UI updates immediately
    updateLink.mutate({ id: linkId, ...data }, {
      onError: (error) => {
        console.error('Failed to update link:', error);

        const errorMessage = error instanceof Error ? error.message : 'Please try again';

        // Check if it's a server timeout
        const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('504');

        Toast.show({
          text1: isTimeout ? 'Server timeout' : 'Update failed',
          text2: isTimeout
            ? 'The update may still be processing. Check back in a moment.'
            : errorMessage,
          type: 'error',
          visibilityTime: isTimeout ? 5000 : 3000,
        });
      }
    });
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Unverified Account Banner */}
        {user && !user.is_verified && (
          <View style={[styles.unverifiedBanner, { backgroundColor: '#FFF3CD', borderColor: '#FFC107' }]}>
            <View style={styles.unverifiedContent}>
              <IconByVariant
                color="#856404"
                name="bell"
                size={20}
                style={styles.unverifiedIcon}
              />
              <View style={styles.unverifiedTextContainer}>
                <Text style={[styles.unverifiedTitle, { color: '#856404' }]}>
                  Email Verification Required
                </Text>
                <Text style={[styles.unverifiedMessage, { color: '#856404' }]}>
                  Please verify your email ({user.email}) to access all features.
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Shared URL Notification */}
        {sharedUrl ? <TouchableOpacity
            onPress={handleCreateLink}
            style={[styles.sharedUrlBanner, { backgroundColor: colors.accent.primary }]}
          >
            <IconByVariant
              color="#ffffff"
              name="link"
              size={16}
            />
            <Text style={[styles.sharedUrlText, { color: '#ffffff' }]}>
              Tap to add shared link
            </Text>
            <IconByVariant
              color="#ffffff"
              name="external"
              size={16}
            />
          </TouchableOpacity> : null}
        
        {/* Filter Header - show when filtered by collection or tag */}
        {(collectionId && collectionName) || (tagId && tagName) ? (
          <View style={[styles.filterHeader, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border.primary }]}>
            <TouchableOpacity
              onPress={() => { 
                if (collectionId) {
                  // Navigate back to Collections tab and clear filter params
                  navigation.navigate('Collections' as never);
                  navigation.setParams({ collectionId: undefined, collectionName: undefined } as any);
                } else if (tagId) {
                  // Navigate back to Tags tab and clear filter params
                  navigation.navigate('Tags' as never);
                  navigation.setParams({ tagId: undefined, tagName: undefined } as any);
                }
              }}
              style={styles.backButton}
            >
              <IconByVariant
                color={colors.text.secondary}
                name="close"
                size={20}
              />
            </TouchableOpacity>
            <View style={styles.filterInfo}>
              <IconByVariant
                color={colors.text.secondary}
                name={collectionId ? "library" : "hash"}
                size={16}
                style={styles.filterIcon}
              />
              <Text numberOfLines={1} style={[styles.filterTitle, { color: colors.text.primary }]}>
                {collectionName || tagName}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        ) : null}
        
        <SearchBar
          onChangeText={setSearchQuery}
          placeholder={collectionName ? `Search in ${collectionName}...` : tagName ? `Search in #${tagName}...` : "Search Links..."}
          value={searchQuery}
        />
        
        <View style={styles.listContainer}>
          <FlatList
            contentContainerStyle={styles.list}
            data={filteredLinks || []}
            keyExtractor={(item: Link) => item.id}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                onRefresh={onRefresh}
                refreshing={refreshing}
                tintColor={colors.text.primary}
              />
            }
            renderItem={({ item }: { readonly item: Link }) => (
              <LinkItem
                link={item}
                onAction={handleLinkAction}
                onPress={handleLinkPress}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleCreateLink}
        style={[styles.floatingButton, { backgroundColor: isDark ? '#FF6B35' : '#F25D15' }]}
      >
        <IconByVariant
          color="#ffffff"
          name="add"
          size={22}
        />
      </TouchableOpacity>

      <Modal
          hideModalContentWhileAnimating
          isVisible={!!editingLink}
          onBackButtonPress={() => { setEditingLink(null); }}
          onBackdropPress={() => { setEditingLink(null); }}
          style={styles.modal}
          useNativeDriver
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background.primary }]}>
            {/* Only show loading if we have no data at all */}
            {(isLoadingCollections && collections.length === 0) || (isLoadingTags && tags.length === 0) ? (
              <View style={[styles.centered, { padding: SPACING.xl }]}>
                <ActivityIndicator color={colors.text.primary} size="large" />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                  Loading form data...
                </Text>
              </View>
            ) : (
              <LinkForm
                collections={collections || []}
                initialData={editingLink || undefined}
                onCancel={() => { setEditingLink(null); }}
                onSubmit={handleUpdateLink}
                submitLabel="Update"
                tags={tags || []}
              />
            )}
          </View>
        </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  createButton: {
    marginBottom: SPACING.lg,
  },
  filterHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterIcon: {
    marginRight: SPACING.xs,
  },
  filterInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    alignItems: 'center',
    borderRadius: 26,
    bottom: 35,
    elevation: 8,
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 52,
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  list: {
    flexGrow: 1,
  },
  listContainer: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  loadingText: {
    fontSize: 16,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    minHeight: '70%',
  },
  placeholder: {
    width: 32,
  },
  retryButton: {
    marginTop: SPACING.md,
  },
  sharedUrlBanner: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sharedUrlText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: SPACING.sm,
    textAlign: 'center',
  },
  title: {
    marginBottom: SPACING.md,
  },
  unverifiedBanner: {
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  unverifiedContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  unverifiedIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  unverifiedMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  unverifiedTextContainer: {
    flex: 1,
  },
  unverifiedTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
}); 