import type { RootTabParamList } from '@/navigation/types';
import type { Link } from '@/types/link.types';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { useCreateLink } from '@/hooks/api/useLinks';
import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useBackgroundDataLoader } from '@/hooks/useBackgroundDataLoader';

import { LinkForm } from '@/components/molecules/LinkForm';
import { SafeScreen } from '@/components/templates';

type AddLinkScreenRouteProperty = RouteProp<RootTabParamList, 'Add'>;

export default function AddLinkScreen() {
  console.log('🔴🔴🔴 AddLinkScreen RENDERED');
  const route = useRoute<AddLinkScreenRouteProperty>();
  const navigation = useNavigation();
  const createLinkMutation = useCreateLink();
  const { collections } = useCollectionsStore();
  const { tags } = useTagsStore();
  const sharedUrlParam = route.params?.sharedUrl;
  
  console.log('🔴🔴🔴 AddLinkScreen route params:', route.params);
  console.log('🔴🔴🔴 Shared URL from params:', sharedUrlParam);
  
  // Use background data loader to ensure data is loading but don't block UI
  useBackgroundDataLoader();
  
  // Track the current shared URL to detect changes
  const [currentSharedUrl, setCurrentSharedUrl] = React.useState<string | undefined>(sharedUrlParam);

  // Handle shared URL from route params - including updates when form is already open
  useEffect(() => {
    if (sharedUrlParam) {
      console.log('📤 Processing shared URL:', sharedUrlParam);
      
      // Check if this is a new shared URL (different from current one)
      const isNewShare = sharedUrlParam !== currentSharedUrl;
      
      // Update current shared URL
      if (isNewShare) {
        setCurrentSharedUrl(sharedUrlParam);
      }
    }
  }, [sharedUrlParam, currentSharedUrl]);

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

  // Don't block UI while collections and tags are loading in background
  // Form will show loading states for individual sections

  return (
    <SafeScreen>
      <LinkForm
        collections={collections}
        initialData={currentSharedUrl ? { url: currentSharedUrl } as Partial<Link> : undefined}
        key={currentSharedUrl || 'default'} // Force re-render when shared URL changes
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        tags={tags}
      />
    </SafeScreen>
  );
} 