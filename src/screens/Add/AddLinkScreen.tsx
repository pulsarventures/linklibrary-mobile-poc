import type { RootTabParamList } from '@/navigation/types';
import type { Link } from '@/types/link.types';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { useCreateLink } from '@/hooks/api/useLinks';
import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { SafeScreen } from '@/components/templates';
import { LinkForm } from '@/components/molecules/LinkForm';

type AddLinkScreenRouteProperty = RouteProp<RootTabParamList, 'Add'>;

export default function AddLinkScreen() {
  const route = useRoute<AddLinkScreenRouteProperty>();
  const navigation = useNavigation();
  const createLinkMutation = useCreateLink();
  const { collections, fetchCollections, loading: isLoadingCollections } = useCollectionsStore();
  const { tags, isLoading: isLoadingTags } = useTagsStore();

  // Handle shared URL from route params
  useEffect(() => {
    if (route.params?.sharedUrl) {
      console.log('📤 Processing shared URL:', route.params.sharedUrl);
      
      // Show toast notification
      Toast.show({
        position: 'top',
        text1: 'URL Received',
        text2: 'Shared link has been added to the form',
        type: 'success',
      });
    }
  }, [route.params?.sharedUrl]);

  const handleSubmit = async (linkData: any) => {
    try {
      await createLinkMutation.mutateAsync(linkData);
      navigation.navigate('Links' as never);
    } catch (error) {
      console.error('❌ Failed to create link:', error);
      throw error;
    }
  };

  // Show loading state while collections and tags are loading
  if (isLoadingCollections || isLoadingTags) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <LinkForm
        collections={collections}
        onSubmit={handleSubmit}
        tags={tags}
        initialData={route.params?.sharedUrl ? { url: route.params.sharedUrl } as Partial<Link> : undefined}
      />
    </SafeScreen>
  );
} 