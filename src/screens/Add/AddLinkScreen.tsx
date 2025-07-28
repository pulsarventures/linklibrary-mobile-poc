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
  
  // Track the current shared URL to detect changes
  const [currentSharedUrl, setCurrentSharedUrl] = React.useState<string | undefined>(route.params?.sharedUrl);

  // Handle shared URL from route params - including updates when form is already open
  useEffect(() => {
    if (route.params?.sharedUrl) {
      console.log('📤 Processing shared URL:', route.params.sharedUrl);
      
      // Check if this is a new shared URL (different from current one)
      const isNewShare = route.params.sharedUrl !== currentSharedUrl;
      
      if (isNewShare && currentSharedUrl) {
        // New share came in while form was already open - show different message
        Toast.show({
          position: 'top',
          text1: 'New URL Received',
          text2: 'Form cleared and new shared link loaded',
          type: 'info',
        });
      } else if (route.params.sharedUrl) {
        // First time loading shared URL
        Toast.show({
          position: 'top',
          text1: 'URL Received',
          text2: 'Shared link has been added to the form',
          type: 'success',
        });
      }
      
      // Update current shared URL
      setCurrentSharedUrl(route.params.sharedUrl);
    }
  }, [route.params?.sharedUrl, currentSharedUrl]);

  const handleSubmit = async (linkData: any) => {
    try {
      await createLinkMutation.mutateAsync(linkData);
      navigation.navigate('Links' as never);
    } catch (error) {
      console.error('❌ Failed to create link:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    navigation.goBack();
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
        key={currentSharedUrl || 'no-share'} // Force re-render when shared URL changes
        collections={collections}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        tags={tags}
        initialData={currentSharedUrl ? { url: currentSharedUrl } as Partial<Link> : undefined}
      />
    </SafeScreen>
  );
} 