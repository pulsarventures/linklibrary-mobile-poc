import type { Link } from '@/types/link.types';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, RefreshControl, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { LinksApiService } from '@/services/links-api.service';

import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useLinksStore } from '@/hooks/domain/links/useLinksStore';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useDeleteLink, useLinks } from '@/hooks/api/useLinks';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { LinkForm } from '@/components/molecules/LinkForm';
import Modal from 'react-native-modal';
import { LinkItem } from '@/components/molecules/LinkItem/LinkItem';
import { SafeScreen } from '@/components/templates';
import { Button, Text } from '@/components/ui';
import { IconByVariant } from '@/components/atoms';

export default function Links() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { collections, fetchCollections, loading: isLoadingCollections } = useCollectionsStore();
  const { tags, isLoading: isLoadingTags } = useTagsStore();
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  // Debug collections and tags data
  useEffect(() => {
    console.log('📊 Collections and Tags Data:', {
      collections: collections?.length || 0,
      tags: tags?.length || 0,
      collectionsData: collections,
      tagsData: tags,
      isLoadingCollections,
      isLoadingTags
    });
  }, [collections, tags, isLoadingCollections, isLoadingTags]);

  // Use React Query for links data
  const { 
    data: linksData,
    error,
    isLoading,
    refetch: refetchLinks
  } = useLinks();

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
        case 'DELETE':
          await deleteLink.mutateAsync(linkId, {
            onSuccess: () => {
              Toast.show({
                type: 'success',
                text1: 'Link deleted successfully',
              });
            },
          });
          break;
        case 'TOGGLE_FAVORITE':
          await LinksApiService.toggleFavorite(linkId);
          // Refresh the links list
          await refetchLinks();
          Toast.show({
            type: 'success',
            text1: 'Favorite status updated',
          });
          break;
        case 'EDIT':
          const linkToEdit = linksData?.find(link => link.id === linkId);
          if (linkToEdit) {
            console.log('✏️ Opening edit for link:', {
              id: linkToEdit.id,
              title: linkToEdit.title,
              collection_id: linkToEdit.collection_id,
              tag_ids: linkToEdit.tag_ids,
              availableCollections: collections?.length || 0,
              availableTags: tags?.length || 0
            });
            setEditingLink(linkToEdit);
          }
          break;
        case 'COPY_LINK':
          // TODO: Implement copy functionality
          console.log('Copy link:', linkId);
          break;
        default:
          console.log('Unknown action:', actionType);
      }
    } catch (error) {
      console.error('Failed to handle link action:', error);
      Toast.show({
        type: 'error',
        text1: error instanceof Error ? error.message : 'Failed to perform action',
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
        type: 'success',
        text1: 'Link updated successfully',
      });
      
      setEditingLink(null);
    } catch (error) {
      console.error('Failed to update link:', error);
      throw error;
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.list}
          data={linksData || []}
          keyExtractor={(item: Link) => item.id}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={refreshing}
              tintColor={colors.text.primary}
            />
          }
          renderItem={({ item }: { item: Link }) => (
            <LinkItem
              link={item}
              onPress={handleLinkPress}
              onAction={handleLinkAction}
            />
          )}
          showsVerticalScrollIndicator={false}
        />

        <Modal
          isVisible={!!editingLink}
          onBackdropPress={() => setEditingLink(null)}
          onBackButtonPress={() => setEditingLink(null)}
          useNativeDriver
          hideModalContentWhileAnimating
          style={styles.modal}
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
                initialData={editingLink || undefined}
                collections={collections || []}
                tags={tags || []}
                onSubmit={handleUpdateLink}
                onCancel={() => setEditingLink(null)}
                submitLabel="Update"
              />
            )}
          </View>
        </Modal>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  createButton: {
    marginBottom: SPACING.lg,
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
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  retryButton: {
    marginTop: SPACING.md,
  },
  title: {
    marginBottom: SPACING.md,
  },
}); 