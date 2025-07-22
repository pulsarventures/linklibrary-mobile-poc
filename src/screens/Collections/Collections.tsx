import type { Collection } from '../../types/collection.types';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { 
  FadeIn, 
  Layout
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { Button, Text } from '@/components/ui';

import { CollectionFormModal, CollectionItem } from '../../components/molecules';
import { useCollectionsStore } from '../../hooks/domain/collections/useCollectionsStore';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Collection>);

export default function Collections() {
  const { colors } = useTheme();
  const { collections, createCollection, deleteCollection, error, fetchCollections, loading, updateCollection } = useCollectionsStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCollections();
    } catch (error) {
      console.error('Failed to refresh collections:', error);
      Toast.show({
        text1: 'Failed to refresh collections',
        type: 'error',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCollection = async (data: { color?: string; description?: string; icon?: string; name: string; }) => {
    setFormLoading(true);
    try {
      await createCollection(data);
      Toast.show({
        text1: 'Collection created successfully',
        type: 'success',
      });
      setShowFormModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
      Toast.show({
        text1: 'Failed to create collection',
        text2: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCollection = async (data: { color?: string; description?: string; icon?: string; name: string; }) => {
    if (!editingCollection) return;
    
    setFormLoading(true);
    try {
      await updateCollection(editingCollection.id, data);
      Toast.show({
        text1: 'Collection updated successfully',
        type: 'success',
      });
      setShowFormModal(false);
      setEditingCollection(null);
    } catch (error) {
      console.error('Failed to update collection:', error);
      Toast.show({
        text1: 'Failed to update collection',
        text2: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    try {
      await deleteCollection(id);
      Toast.show({
        text1: 'Collection deleted successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to delete collection:', error);
      Toast.show({
        text1: 'Failed to delete collection',
        text2: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      });
    }
  };

  const handleFormSubmit = async (data: { color?: string; description?: string; icon?: string; name: string; }) => {
    await (editingCollection ? handleUpdateCollection(data) : handleCreateCollection(data));
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingCollection(null);
  };

  const handleAction = (actionType: string, id: number) => {
    'worklet';
    switch (actionType) {
      case 'DELETE': {
        const collectionToDelete = collections.find(c => c.id === id);
        if (collectionToDelete) {
          Alert.alert(
            'Delete Collection',
            `Are you sure you want to delete "${collectionToDelete.name}"? This action cannot be undone.`,
            [
              { style: 'cancel', text: 'Cancel' },
              { 
                onPress: () => handleDeleteCollection(id), 
                style: 'destructive',
                text: 'Delete'
              }
            ]
          );
        }
        break;
      }
      case 'EDIT': {
        const collection = collections.find(c => c.id === id);
        if (collection) {
          setEditingCollection(collection);
          setShowFormModal(true);
        }
        break;
      }
      case 'VIEW': {
        // Navigate to collection view
        break;
      }
      default: {
        break;
      }
    }
  };

  const renderItem = ({ item }: { item: Collection }) => (
    <Animated.View
      entering={FadeIn.springify()}
      layout={Layout.springify()}
    >
      <CollectionItem collection={item} onAction={handleAction} view="list" />
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator color={colors.accent.primary} size="large" />
        </View>
      </SafeScreen>
    );
  }

  if (error) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Failed to load collections
          </Text>
          <Pressable
            onPress={() => fetchCollections()}
            style={({ pressed }) => [
              styles.retryButton,
              {
                backgroundColor: pressed ? colors.accent.primary + '80' : colors.accent.primary,
              },
            ]}
          >
            <Text style={[styles.retryText, { color: colors.text.inverse }]}>Retry</Text>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  if (!collections?.length) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <IconByVariant
            color={colors.text.secondary}
            name="collection"
            size={48}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            No collections yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            Create your first collection to start organizing your links
          </Text>
          <Button
            onPress={() => { setShowFormModal(true); }}
            style={styles.createButton}
            variant="primary"
          >
            Create
          </Button>
        </View>
        
        <CollectionFormModal
          loading={formLoading}
          onClose={handleCloseFormModal}
          onSubmit={handleFormSubmit}
          visible={showFormModal}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            onPress={() => { setShowFormModal(true); }}
            style={styles.createButton}
            variant="primary"
          >
            Create
          </Button>
        </View>

        <AnimatedFlatList
          contentContainerStyle={styles.list}
          data={collections}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={refreshing}
              tintColor={colors.accent.primary}
            />
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      <CollectionFormModal
        collection={editingCollection}
        loading={formLoading}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        visible={showFormModal}
      />
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  createButton: {
    height: 40,
    minWidth: 100,
  },

  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  list: {
    flex: 1,
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 