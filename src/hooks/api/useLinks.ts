import type { Link } from '@/types/link.types';

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { LinksApiService } from '@/services/api/links.service';

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
  
  return useInfiniteQuery({
    queryKey: linkKeys.list({ ...parameters, infinite: true }),
    queryFn: ({ pageParam = 0 }) => {
      return fetchLinks({
        ...parameters,
        limit: ITEMS_PER_PAGE,
        skip: pageParam * ITEMS_PER_PAGE,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      // Return next page number if there are more items
      return lastPage.has_more ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
    // Enable background prefetch for better UX
    refetchOnMount: false, // Don't refetch if we have cached data
    refetchOnWindowFocus: false,
  });
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
        const newLinks = [optimisticLink, ...links];
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
      
      // Replace optimistic update with real data
      try {
        const { useLinksStore } = require('@/hooks/domain/links/useLinksStore');
        const { links, setLinks } = useLinksStore.getState();
        
        // Remove optimistic link and add real link
        const linksWithoutOptimistic = links.filter(link => !link.id.startsWith('temp-'));
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
    onError: (error) => {
      console.error('Failed to update link:', error);
    },
    onSuccess: (updatedLink) => {
      // Invalidate and refetch links list
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() });
      
      // Update the specific link in cache
      queryClient.setQueryData(linkKeys.detail(updatedLink.id), updatedLink);
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteLink,
    onError: (error) => {
      console.error('Failed to delete link:', error);
    },
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch links list
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() });
      
      // Remove the deleted link from cache
      queryClient.removeQueries({ queryKey: linkKeys.detail(deletedId) });
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
                  if (page && page.items && Array.isArray(page.items)) {
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
        context.previousLinks.forEach(([queryKey, data]) => {
          if (data !== undefined) {
            queryClient.setQueryData(queryKey, data);
          }
        });
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
                  if (page && page.items && Array.isArray(page.items)) {
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