import type { Link } from '@/types/link.types';

import { LinksApiService } from '@/services/api/links.service';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys
export const linkKeys = {
  all: ['links'] as const,
  detail: (id: string) => [...linkKeys.details(), id] as const,
  details: () => [...linkKeys.all, 'detail'] as const,
  list: (filters: any) => [...linkKeys.lists(), filters] as const,  // Remove extra nesting
  lists: () => [...linkKeys.all, 'list'] as const,
};

// Fetch links with pagination
const fetchLinks = async (parameters?: {
  collection_id?: number;
  is_favorite?: boolean;
  limit?: number;
  search?: string;
  skip?: number;
  sort_by?: string;
  sort_desc?: boolean;
  tag_id?: number;        // Single tag filter
  tag_ids?: number[];     // Multiple tags filter (for advanced search)
}) => {
  const response = await LinksApiService.getLinks(parameters);
  return response; // Return full response with pagination metadata
};

// Legacy fetch for backward compatibility
const fetchLinksItems = async (parameters?: {
  collection_id?: number;
  is_favorite?: boolean;
  limit?: number;
  search?: string;
  skip?: number;
  sort_by?: string;
  sort_desc?: boolean;
  tag_id?: number;
  tag_ids?: number[];
}): Promise<Link[]> => {
  const response = await LinksApiService.getLinks(parameters);
  return response.items;
};

// Fetch single link
const fetchLink = async (id: string): Promise<Link> => {
  // This would need to be implemented in LinksApiService if needed
  throw new Error('fetchLink not implemented');
};

// Create link
const createLink = async (linkData: Partial<Link>): Promise<Link> => {
  // Creating link
  return LinksApiService.createLink(linkData);
};

// Update link
const updateLink = async ({ id, ...linkData }: { id: string } & Partial<Link>): Promise<Link> => {
  return LinksApiService.updateLink(id, linkData);
};

// Delete link
const deleteLink = async (id: string): Promise<void> => {
  return LinksApiService.deleteLink(id);
};

// React Query hooks
// Infinite query for links with pagination
export const useInfiniteLinks = (parameters?: {
  collection_id?: number;
  is_favorite?: boolean;
  search?: string;
  sort_by?: string;
  sort_desc?: boolean;
  tag_id?: number;
  tag_ids?: number[];
}) => {
  const ITEMS_PER_PAGE = 10;

  console.log('🔍 useInfiniteLinks: Hook called with parameters:', parameters);

  const query = useInfiniteQuery({
    enabled: true, // Always enabled - query will run immediately
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
    getNextPageParam: (lastPage, allPages) => {
      // Return next page number if there are more items
      return lastPage.has_more ? allPages.length : undefined;
    },
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) => {
      console.log('🔍 useInfiniteLinks: Fetching page', pageParam, 'with params:', parameters);
      return fetchLinks({
        ...parameters,
        limit: ITEMS_PER_PAGE,
        skip: pageParam * ITEMS_PER_PAGE,
      });
    },
    queryKey: linkKeys.list({ ...parameters, infinite: true }),
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('Authentication required')) {
        console.log('🔍 useInfiniteLinks: Auth error, not retrying');
        return false;
      }
      // Retry on timeout and server errors
      if (error instanceof Error &&
          (error.message.includes('timeout') ||
           error.message.includes('Server error') ||
           error.message.includes('504') ||
           error.message.includes('502') ||
           error.message.includes('503'))) {
        console.log('🔍 useInfiniteLinks: Server error, retrying...', failureCount);
        return failureCount < 3;
      }
      return failureCount < 2; // Fewer retries for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh
    // Enable background prefetch for better UX
    refetchOnMount: 'always', // Always refetch on mount for physical devices
    refetchOnWindowFocus: false,
  });

  console.log('🔍 useInfiniteLinks: Query state:', {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message,
    dataLength: query.data?.pages?.length
  });

  return query;
};

// Legacy useLinks hook for backward compatibility 
export const useLinks = (parameters?: {
  collection_id?: number;
  is_favorite?: boolean;
  limit?: number;
  search?: string;
  skip?: number;
  sort_by?: string;
  sort_desc?: boolean;
  tag_id?: number;        // Single tag filter  
  tag_ids?: number[];     // Multiple tags filter (for advanced search)
}) => {
  // Now cache ALL requests for better UX
  return useQuery({
    gcTime: 30 * 60 * 1000, // 30 minutes cache for all requests
    queryFn: () => {
      return fetchLinksItems(parameters);
    },
    queryKey: linkKeys.list(parameters),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for all requests
  });
};

export const useLink = (id: string) => {
  return useQuery({
    enabled: !!id,
    gcTime: 10 * 60 * 1000, // 10 minutes
    queryFn: () => fetchLink(id),
    queryKey: linkKeys.detail(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createLink,
    onError: (error, variables, context) => {
      console.error('❌ useCreateLink mutation failed:', error);
      
      // Rollback optimistic update if it failed
      if (context?.previousLinks) {
        try {
          const { useLinksStore } = require('@/hooks/domain/links/useLinksStore');
          const { setLinks } = useLinksStore.getState();
          setLinks(context.previousLinks);
        } catch (rollbackError) {
          console.error('❌ Failed to rollback optimistic update:', rollbackError);
        }
      }
    },
    onMutate: async (variables) => {
      // useCreateLink mutation started
      
      // Optimistic update: immediately add the new link to the store
      try {
        const { useLinksStore } = require('@/hooks/domain/links/useLinksStore');
        const { links, setLinks } = useLinksStore.getState();
        
        // Create optimistic link with temporary ID
        const optimisticLink: Link = {
          collection_id: variables.collection_id || null,
          content_type: '',
          created_at: new Date().toISOString(),
          favicon_url: '',
          id: `temp-${Date.now()}`,
          input_source: variables.input_source || 'mobile',
          is_archived: false,
          is_favorite: variables.is_favorite || false,
          is_read: false,
          notes: variables.notes || '',
          summary: variables.summary || '',
          tag_ids: variables.tag_ids || [],
          tags: [], // Will be populated when real response comes back
          title: variables.title || '',
          updated_at: new Date().toISOString(),
          url: variables.url || '',
        };
        
        // Add to beginning of list (most recent first)
        // Filter out any invalid links while we're at it
        const validLinks = links.filter(link => link && link.id);
        const newLinks = [optimisticLink, ...validLinks];
        setLinks(newLinks);
        
        // Optimistic update applied
        
        // Return context for rollback if needed
        return { previousLinks: links };
      } catch (error) {
        console.error('❌ Failed to apply optimistic update:', error);
        return {};
      }
    },
    onSuccess: async (newLink, variables, context) => {
      // useCreateLink mutation succeeded
      
      // Invalidate and refetch TanStack Query cache
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() });
      
      // Add the new link to the cache
      queryClient.setQueryData(linkKeys.detail(newLink.id), newLink);
      
      // Smart refresh collections and tags in background
      if (newLink.collection_id) {
        // Refresh only the affected collection
        const { useCollectionsStore } = await import('@/hooks/domain/collections/useCollectionsStore');
        const { fetchCollections } = useCollectionsStore.getState();
        fetchCollections({}, true).catch(console.error);
      }
      
      if (newLink.tag_ids && newLink.tag_ids.length > 0) {
        // Refresh tags to update counts
        queryClient.invalidateQueries({ queryKey: ['tags'] });
      }
      
      // Replace optimistic update with real data
      try {
        const { useLinksStore } = require('@/hooks/domain/links/useLinksStore');
        const { links, setLinks } = useLinksStore.getState();
        
        // Remove optimistic link and add real link
        const linksWithoutOptimistic = links.filter(link => link.id && !String(link.id).startsWith('temp-'));
        const newLinks = [newLink, ...linksWithoutOptimistic];
        setLinks(newLinks);
        
        // Real link data replaced optimistic update
      } catch (error) {
        console.error('❌ Failed to replace optimistic update:', error);
        // Fallback: just refresh the entire store
        try {
          const { useLinksStore } = await import('@/hooks/domain/links/useLinksStore');
          const { fetchLinks } = useLinksStore.getState();
          await fetchLinks();
          // Links store refreshed
        } catch (refreshError) {
          console.error('❌ Failed to refresh links store:', refreshError);
        }
      }
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateLink,
    retry: (failureCount, error: any) => {
      // Retry up to 2 times for server errors (5xx) and timeouts
      if (failureCount < 2 && (
        error?.message?.includes('timeout') ||
        error?.message?.includes('Server error (5') ||
        error?.message?.includes('504') ||
        error?.message?.includes('502') ||
        error?.message?.includes('503')
      )) {
        if (__DEV__) {
          console.log(`🔄 Retrying update link (attempt ${failureCount + 1}/2) due to:`, error.message);
        }
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s, 3s
    onMutate: async (variables) => {
      if (__DEV__) {
        console.log('🚀 OPTIMISTIC UPDATE: Starting optimistic update for link', variables.id);
      }
      
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: linkKeys.all });

      // Snapshot the previous values for all link queries
      const previousData = new Map();
      queryClient.getQueriesData({ queryKey: linkKeys.all }).forEach(([key, data]) => {
        previousData.set(JSON.stringify(key), data);
      });
      
      // Optimistically update the cache
      queryClient.setQueryData(linkKeys.detail(variables.id), (old: Link | undefined) => {
        if (!old) return old;
        const updated = { ...old, ...variables };
        if (__DEV__) {
          console.log('🚀 OPTIMISTIC UPDATE: Updated detail cache', updated);
        }
        return updated;
      });
      
      // Update ALL links queries optimistically (including infinite queries)
      queryClient.setQueriesData({ queryKey: linkKeys.all }, (old: any) => {
        // Handle infinite query structure
        if (old?.pages) {
          const updated = {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items?.map((link: Link) =>
                link.id === variables.id ? { ...link, ...variables } : link
              ) || page.items
            }))
          };
          if (__DEV__) {
            console.log('🚀 OPTIMISTIC UPDATE: Updated infinite query cache');
          }
          return updated;
        }
        // Handle regular query structure
        if (old?.items) {
          const updated = {
            ...old,
            items: old.items.map((link: Link) =>
              link.id === variables.id ? { ...link, ...variables } : link
            )
          };
          if (__DEV__) {
            console.log('🚀 OPTIMISTIC UPDATE: Updated list cache');
          }
          return updated;
        }
        return old;
      });
      
      if (__DEV__) {
        console.log('🚀 OPTIMISTIC UPDATE: Completed optimistic update');
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error('Failed to update link:', error);

      // Revert optimistic updates on error
      if (context?.previousData) {
        context.previousData.forEach((data, keyString) => {
          const key = JSON.parse(keyString);
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSuccess: async (updatedLink, variables) => {
      // Update the specific link in cache with server response
      queryClient.setQueryData(linkKeys.detail(updatedLink.id), updatedLink);
      
      // Update ALL links queries with server response (including infinite queries)
      queryClient.setQueriesData({ queryKey: linkKeys.all }, (old: any) => {
        // Handle infinite query structure
        if (old?.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items?.map((link: Link) =>
                link.id === updatedLink.id ? updatedLink : link
              ) || page.items
            }))
          };
        }
        // Handle regular query structure
        if (old?.items) {
          return {
            ...old,
            items: old.items.map((link: Link) =>
              link.id === updatedLink.id ? updatedLink : link
            )
          };
        }
        return old;
      });
      
      // Only invalidate related queries if they actually changed
      const oldLink = queryClient.getQueryData(linkKeys.detail(updatedLink.id)) as Link | undefined;
      const collectionChanged = oldLink?.collection_id !== updatedLink.collection_id;
      const oldTagIds = oldLink?.tag_ids || [];
      const newTagIds = updatedLink.tag_ids || [];
      const tagsChanged = JSON.stringify(oldTagIds.sort()) !== JSON.stringify(newTagIds.sort());
      
      // Only refresh collections if collection actually changed
      if (collectionChanged) {
        queryClient.invalidateQueries({ queryKey: ['collections'] });
      }
      
      // Only refresh tags if tags actually changed
      if (tagsChanged) {
        queryClient.invalidateQueries({ queryKey: ['tags'] });
      }
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteLink,
    onMutate: async (linkId: string) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: linkKeys.lists() });

      // Snapshot previous data for rollback
      const previousData = queryClient.getQueriesData({ queryKey: linkKeys.lists() });
      
      // Store the link data before deletion for smart refresh
      let linkToDelete: Link | undefined;
      
      // Optimistically remove the link from all queries immediately
      queryClient.setQueriesData(
        { queryKey: linkKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          try {
            // Handle infinite query data structure
            if (oldData.pages && Array.isArray(oldData.pages)) {
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                  if (page?.items && Array.isArray(page.items)) {
                    // Find and store the link being deleted
                    const linkInPage = page.items.find((link: Link) => link.id === linkId);
                    if (linkInPage && !linkToDelete) {
                      linkToDelete = linkInPage;
                    }
                    
                    return {
                      ...page,
                      items: page.items.filter((link: Link) => link.id !== linkId),
                      total: page.total ? page.total - 1 : page.total
                    };
                  }
                  return page;
                }),
              };
            }
            
            // Handle regular array of links
            if (Array.isArray(oldData)) {
              const linkInArray = oldData.find((link: Link) => link.id === linkId);
              if (linkInArray && !linkToDelete) {
                linkToDelete = linkInArray;
              }
              return oldData.filter((link: Link) => link.id !== linkId);
            }
            
            return oldData;
          } catch (error) {
            console.error('Error updating cache:', error);
            return oldData;
          }
        }
      );
      
      return { previousData, linkToDelete };
    },
    onError: (error, linkId, context) => {
      console.error('Failed to delete link:', error);
      
      // Rollback optimistic update on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (_, deletedId, context) => {
      // Remove the deleted link from cache (no API call needed)
      queryClient.removeQueries({ queryKey: linkKeys.detail(deletedId) });
      
      // NO API CALLS - just update cache optimistically
      // Collections and tags will be refreshed when user navigates to those screens
      // This prevents the API storm that was crashing the server
      
      if (__DEV__) {
        console.log(`🗑️ Successfully deleted link ${deletedId} - NO additional API calls`);
      }
    },
  });
};

// Toggle favorite with optimistic updates
const toggleFavorite = async (linkId: string): Promise<Link> => {
  return LinksApiService.toggleFavorite(linkId);
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    
    // Optimistic update - runs immediately when mutation is called
    onMutate: async (linkId: string) => {
      // Optimistic update: toggling favorite
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: linkKeys.lists() });

      // Snapshot the previous value for rollback
      const previousLinks = queryClient.getQueriesData({ queryKey: linkKeys.lists() });

      // Optimistically update all link lists (including infinite queries)
      queryClient.setQueriesData(
        { queryKey: linkKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          try {
            // Handle infinite query data structure
            if (oldData.pages && Array.isArray(oldData.pages)) {
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                  if (page?.items && Array.isArray(page.items)) {
                    return {
                      ...page,
                      items: page.items.map((link: Link) => 
                        link.id === linkId 
                          ? { ...link, is_favorite: !link.is_favorite }
                          : link
                      )
                    };
                  }
                  return page;
                })
              };
            }
            
            // Handle regular array
            if (Array.isArray(oldData)) {
              return oldData.map((link: Link) => 
                link.id === linkId 
                  ? { ...link, is_favorite: !link.is_favorite }
                  : link
              );
            }
            
            return oldData;
          } catch (error) {
            console.error('Error in optimistic update:', error);
            return oldData; // Return unchanged data on error
          }
        }
      );

      // Return context with previous data for rollback
      return { previousLinks };
    },

    // If mutation fails, rollback the optimistic update
    onError: (error, linkId, context) => {
      console.error('❌ Toggle favorite failed, rolling back optimistic update:', error);
      
      if (context?.previousLinks) {
        // Restore all previous query data safely
        for (const [queryKey, data] of context.previousLinks) {
          if (data !== undefined) {
            queryClient.setQueryData(queryKey, data);
          }
        }
      }
    },

    // Always refetch after success to ensure data consistency
    onSettled: () => {
      // Toggle favorite settled
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() });
    },

    onSuccess: (updatedLink, linkId) => {
      // Toggle favorite succeeded
      
      // Update with the real data from server (in case there are other changes)
      queryClient.setQueriesData(
        { queryKey: linkKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          try {
            // Handle infinite query data structure
            if (oldData.pages && Array.isArray(oldData.pages)) {
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                  if (page?.items && Array.isArray(page.items)) {
                    return {
                      ...page,
                      items: page.items.map((link: Link) => 
                        link.id === linkId ? updatedLink : link
                      )
                    };
                  }
                  return page;
                })
              };
            }
            
            // Handle regular array
            if (Array.isArray(oldData)) {
              return oldData.map((link: Link) => 
                link.id === linkId ? updatedLink : link
              );
            }
            
            return oldData;
          } catch (error) {
            console.error('Error in success update:', error);
            return oldData; // Return unchanged data on error
          }
        }
      );
    },
  });
}; 