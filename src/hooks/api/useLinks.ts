import type { Link } from '@/types/link.types';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LinksApiService } from '@/services/api/links.service';

// Query keys
export const linkKeys = {
  all: ['links'] as const,
  detail: (id: string) => [...linkKeys.details(), id] as const,
  details: () => [...linkKeys.all, 'detail'] as const,
  list: (filters: any) => [...linkKeys.lists(), { filters }] as const,
  lists: () => [...linkKeys.all, 'list'] as const,
};

// Fetch links
const fetchLinks = async (): Promise<Link[]> => {
  const response = await LinksApiService.getLinks();
  return response.items;
};

// Fetch single link
const fetchLink = async (id: string): Promise<Link> => {
  // This would need to be implemented in LinksApiService if needed
  throw new Error('fetchLink not implemented');
};

// Create link
const createLink = async (linkData: Partial<Link>): Promise<Link> => {
  console.log('🔗 Creating link with data:', linkData);
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
export const useLinks = () => {
  return useQuery({
    gcTime: 5 * 60 * 1000, // 5 minutes
    queryFn: fetchLinks,
    queryKey: linkKeys.lists(),
    staleTime: 2 * 60 * 1000, // 2 minutes
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
      console.log('🚀 useCreateLink mutation started with:', variables);
      
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
        
        console.log('✅ Optimistic update applied - new link added to top of list');
        
        // Return context for rollback if needed
        return { previousLinks: links };
      } catch (error) {
        console.error('❌ Failed to apply optimistic update:', error);
        return {};
      }
    },
    onSuccess: async (newLink, variables, context) => {
      console.log('✅ useCreateLink mutation succeeded:', newLink);
      
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
        
        console.log('✅ Real link data replaced optimistic update');
      } catch (error) {
        console.error('❌ Failed to replace optimistic update:', error);
        // Fallback: just refresh the entire store
        try {
          const { useLinksStore } = await import('@/hooks/domain/links/useLinksStore');
          const { fetchLinks } = useLinksStore.getState();
          await fetchLinks();
          console.log('✅ Links store refreshed after creating new link');
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