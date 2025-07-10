import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeScreen } from '@/components/templates';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';
import { LinkItem } from '@/components/molecules/LinkItem/LinkItem';
import type { Link } from '@/types/link.types';
import { useLinksStore } from '@/hooks/domain/links/useLinksStore';
import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import Toast from 'react-native-toast-message';

export default function Links() {
  const { colors } = useTheme();
  const { links, isLoading, error, fetchLinks } = useLinksStore();
  const { fetchCollections } = useCollectionsStore();
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      // Fetch collections first to have them in cache
      await fetchCollections();
      await fetchLinks();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load data',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchLinks();
    } catch (error) {
      console.error('Failed to refresh links:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLinkPress = (link: Link) => {
    // TODO: Handle link press - open URL or show details
    console.log('Link pressed:', link);
  };

  const handleCreateLink = () => {
    // TODO: Handle create link
    console.log('Create new link');
  };

  if (isLoading && !refreshing) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.text.primary} />
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
            variant="gradient"
            onPress={loadInitialData}
            style={styles.retryButton}
          >
            Retry
          </Button>
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
          Links
        </Text>

        <FlatList
          data={links}
          renderItem={({ item }) => (
            <LinkItem
              link={item}
              onPress={handleLinkPress}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text.primary}
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
  createButton: {
    marginBottom: SPACING.lg,
  },
  retryButton: {
    marginTop: SPACING.md,
  },
  list: {
    flexGrow: 1,
  },
}); 