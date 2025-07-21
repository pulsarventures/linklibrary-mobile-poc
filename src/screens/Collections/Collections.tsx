import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeScreen } from '@/components/templates';
import { useCollectionsStore } from '../../hooks/domain/collections/useCollectionsStore';
import { CollectionItem, CollectionFormModal } from '../../components/molecules';
import { useTheme } from '@/theme';
import type { Collection } from '../../types/collection.types';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { Text, Button } from '@/components/ui';
import Animated, { 
  FadeIn, 
  Layout
} from 'react-native-reanimated';
import { IconByVariant } from '@/components/atoms';
import { SPACING } from '@/theme/styles/spacing';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Collection>);

export default function Collections() {
  const { colors } = useTheme();
  const { collections, loading, error, fetchCollections, createCollection, updateCollection, deleteCollection } = useCollectionsStore();
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
        type: 'error',
        text1: 'Failed to refresh collections',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCollection = async (data: { name: string; description?: string; icon?: string; color?: string }) => {
    setFormLoading(true);
    try {
      await createCollection(data);
      Toast.show({
        type: 'success',
        text1: 'Collection created successfully',
      });
      setShowFormModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to create collection',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCollection = async (data: { name: string; description?: string; icon?: string; color?: string }) => {
    if (!editingCollection) return;
    
    setFormLoading(true);
    try {
      await updateCollection(editingCollection.id, data);
      Toast.show({
        type: 'success',
        text1: 'Collection updated successfully',
      });
      setShowFormModal(false);
      setEditingCollection(null);
    } catch (error) {
      console.error('Failed to update collection:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update collection',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    try {
      await deleteCollection(id);
      Toast.show({
        type: 'success',
        text1: 'Collection deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete collection:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to delete collection',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleFormSubmit = async (data: { name: string; description?: string; icon?: string; color?: string }) => {
    if (editingCollection) {
      await handleUpdateCollection(data);
    } else {
      await handleCreateCollection(data);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingCollection(null);
  };

  const handleAction = (actionType: string, id: number) => {
    'worklet';
    switch (actionType) {
      case 'VIEW':
        // Navigate to collection view
        break;
      case 'EDIT':
        const collection = collections.find(c => c.id === id);
        if (collection) {
          setEditingCollection(collection);
          setShowFormModal(true);
        }
        break;
      case 'DELETE':
        const collectionToDelete = collections.find(c => c.id === id);
        if (collectionToDelete) {
          Alert.alert(
            'Delete Collection',
            `Are you sure you want to delete "${collectionToDelete.name}"? This action cannot be undone.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Delete', 
                style: 'destructive',
                onPress: () => handleDeleteCollection(id)
              }
            ]
          );
        }
        break;
      default:
        break;
    }
  };

  const renderItem = ({ item }: { item: Collection }) => (
    <Animated.View
      entering={FadeIn.springify()}
      layout={Layout.springify()}
    >
      <CollectionItem collection={item} view="list" onAction={handleAction} />
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
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
            name="collection"
            size={48}
            color={colors.text.secondary}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            No collections yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            Create your first collection to start organizing your links
          </Text>
          <Button
            variant="primary"
            onPress={() => setShowFormModal(true)}
            style={styles.createButton}
          >
            Create
          </Button>
        </View>
        
        <CollectionFormModal
          visible={showFormModal}
          onClose={handleCloseFormModal}
          onSubmit={handleFormSubmit}
          loading={formLoading}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            variant="primary"
            onPress={() => setShowFormModal(true)}
            style={styles.createButton}
          >
            Create
          </Button>
        </View>

        <AnimatedFlatList
          data={collections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
            />
          }
        />
      </View>
      
      <CollectionFormModal
        visible={showFormModal}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        collection={editingCollection}
        loading={formLoading}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  createButton: {
    minWidth: 100,
    height: 40,
  },
  list: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
}); 