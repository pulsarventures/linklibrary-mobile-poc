import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { TagsApiService } from '@/services/tags-api.service';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';

/**
 * Background data loader that preloads collections and tags for better UX
 * - Loads data in background after authentication
 * - Uses existing caching mechanisms
 * - Doesn't block UI rendering
 * - Provides fresh data when user navigates to forms
 */
export function useBackgroundDataLoader() {
  const queryClient = useQueryClient();
  const { fetchCollections } = useCollectionsStore();
  const { isAuthenticated, initialized } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !initialized) {
      return;
    }

    // Small delay to not interfere with initial app render
    const timeoutId = setTimeout(() => {
      preloadData();
    }, 500); // 500ms delay for smooth startup

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, initialized]);

  const preloadData = async () => {
    try {
      
      // Load collections and tags in parallel for fastest loading
      const loadPromises = [
        // Load collections using the existing store (with its caching)
        fetchCollections().catch(error => {
          console.warn('⚠️ Background: Collections preload failed:', error.message);
        }),
        
        // Prefetch tags using TanStack Query
        queryClient.prefetchQuery({
          queryKey: ['tags'],
          queryFn: () => TagsApiService.getTags({ sort_by: 'name', sort_desc: false }),
          staleTime: 5 * 60 * 1000, // 5 minutes - same as tags store
        }).catch(error => {
          console.warn('⚠️ Background: Tags preload failed:', error.message);
        })
      ];

      await Promise.allSettled(loadPromises);

    } catch (error) {
      // Don't throw errors from background loading - it's optional
      console.warn('⚠️ Background: Data preload error:', error);
    }
  };

  // Return loading states for components that might want to show skeletons
  const collectionsStore = useCollectionsStore();
  
  return {
    isLoadingCollections: collectionsStore.loading,
    hasCollections: collectionsStore.collections.length > 0,
    hasTags: queryClient.getQueryData(['tags']) !== undefined,
  };
}