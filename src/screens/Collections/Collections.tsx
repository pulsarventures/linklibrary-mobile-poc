import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { SafeScreen } from '@/components/templates';
import { useCollectionsStore } from '../../hooks/domain/collections/useCollectionsStore';
import { CollectionItem } from '../../components/molecules/CollectionItem/CollectionItem';
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
  const { collections, loading, error, fetchCollections } = useCollectionsStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

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

  const handleAction = (actionType: string, id: number) => {
    'worklet';
    switch (actionType) {
      case 'VIEW':
        // Navigate to collection view
        break;
      case 'EDIT':
        // Open edit modal
        break;
      case 'DELETE':
        // Open delete confirmation
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
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text 
          variant="title"
          weight="bold"
          style={[styles.title, { color: colors.text.primary }]}
        >
          Collections
        </Text>

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
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: SPACING.md,
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