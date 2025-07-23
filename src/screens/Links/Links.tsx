import type { RootTabParamList } from '@/navigation/types';
import type { Link } from '@/types/link.types';
import type { RouteProp } from '@react-navigation/native';

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';

import { useDeleteLink, useLinks } from '@/hooks/api/useLinks';
import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';
import { LinkForm } from '@/components/molecules/LinkForm';
import { LinkItem } from '@/components/molecules/LinkItem/LinkItem';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SafeScreen } from '@/components/templates';
import { Button, Text } from '@/components/ui';

import { LinksApiService } from '@/services/links-api.service';

export default function Links() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootTabParamList, 'Links'>>();
  const { collections, fetchCollections, loading: isLoadingCollections } = useCollectionsStore();
  const { isLoading: isLoadingTags, tags } = useTagsStore();
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get collection and tag filter from route params
  const { collectionId, collectionName, tagId, tagName } = route.params || {};
  const isFiltered = !!(collectionId || tagId);

  // Debug collections and tags data
  useEffect(() => {
    console.log('📊 Collections and Tags Data:', {
      collections: collections?.length || 0,
      collectionsData: collections,
      isLoadingCollections,
      isLoadingTags,
      tags: tags?.length || 0,
      tagsData: tags
    });
  }, [collections, tags, isLoadingCollections, isLoadingTags]);

  // Use React Query for links data with optional collection or tag filter
  const linkQueryParameters = collectionId 
    ? { collection_id: collectionId } 
    : tagId 
      ? { tag_ids: [tagId] }
      : undefined;
  const { 
    data: linksData,
    error,
    isLoading,
    refetch: refetchLinks
  } = useLinks(linkQueryParameters);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      // Fetch collections to have them in cache (tags are auto-fetched by React Query)
      await fetchCollections();
      await refetchLinks();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Toast.show({
        text1: 'Failed to load data',
        type: 'error',
      });
    }
  };

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

  const handleLinkPress = async (link: Link) => {
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

  const handleCreateLink = () => {
    navigation.navigate('Add' as never);
  };

  const deleteLink = useDeleteLink();

  const handleLinkAction = async (actionType: string, linkId: string) => {
    try {
      switch (actionType) {
        case 'COPY_LINK': {
          // TODO: Implement copy functionality
          console.log('Copy link:', linkId);
          break;
        }
        case 'DELETE': {
          await deleteLink.mutateAsync(linkId, {
            onSuccess: () => {
              Toast.show({
                text1: 'Link deleted successfully',
                type: 'success',
              });
            },
          });
          break;
        }
        case 'EDIT': {
          const linkToEdit = linksData?.find(link => link.id === linkId);
          if (linkToEdit) {
            console.log('✏️ Opening edit for link:', {
              availableCollections: collections?.length || 0,
              availableTags: tags?.length || 0,
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
          await LinksApiService.toggleFavorite(linkId);
          // Refresh the links list
          await refetchLinks();
          Toast.show({
            text1: 'Favorite status updated',
            type: 'success',
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

  if (isLoading && !refreshing) {
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
            onPress={loadInitialData}
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
    try {
      if (!editingLink) return;
      
      await LinksApiService.updateLink(editingLink.id, data);
      await refetchLinks();
      
      Toast.show({
        text1: 'Link updated successfully',
        type: 'success',
      });
      
      setEditingLink(null);
    } catch (error) {
      console.error('Failed to update link:', error);
      throw error;
    }
  };

  // Filter links based on search query
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

  return (
    <SafeScreen>
      <View style={styles.container}>
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
        <FlatList
          contentContainerStyle={styles.list}
          data={filteredLinks || []}
          keyExtractor={(item: Link) => item.id}
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

        <Modal
          hideModalContentWhileAnimating
          isVisible={!!editingLink}
          onBackButtonPress={() => { setEditingLink(null); }}
          onBackdropPress={() => { setEditingLink(null); }}
          style={styles.modal}
          useNativeDriver
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background.primary }]}>
            {(isLoadingCollections || isLoadingTags) ? (
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
      </View>
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
  list: {
    flexGrow: 1,
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
    maxHeight: '80%',
  },
  placeholder: {
    width: 32,
  },
  retryButton: {
    marginTop: SPACING.md,
  },
  title: {
    marginBottom: SPACING.md,
  },
}); 