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
    onError: (error) => {
      console.error('❌ useCreateLink mutation failed:', error);
    },
    onMutate: (variables) => {
      console.log('🚀 useCreateLink mutation started with:', variables);
    },
    onSuccess: (newLink) => {
      console.log('✅ useCreateLink mutation succeeded:', newLink);
      // Invalidate and refetch links list
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() });
      
      // Add the new link to the cache
      queryClient.setQueryData(linkKeys.detail(newLink.id), newLink);
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