import type { Tag } from '@/types/tag.types';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/services/api/client';

// Query keys
export const tagKeys = {
  all: ['tags'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  list: (filters: any) => [...tagKeys.lists(), { filters }] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
};

// Fetch tags
const fetchTags = async (): Promise<Tag[]> => {
  try {
    const response = await apiClient.get<Tag[]>('/tags');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
};

// Fetch single tag
const fetchTag = async (id: string): Promise<Tag> => {
  return apiClient.get<Tag>(`/tags/${id}`);
};

// Create tag
const createTag = async (tagData: Partial<Tag>): Promise<Tag> => {
  return apiClient.post<Tag>('/tags', tagData);
};

// Update tag
const updateTag = async ({ id, ...tagData }: { id: string } & Partial<Tag>): Promise<Tag> => {
  return apiClient.put<Tag>(`/tags/${id}`, tagData);
};

// Delete tag
const deleteTag = async (id: string): Promise<void> => {
  return apiClient.delete(`/tags/${id}`);
};

// React Query hooks
export const useTags = () => {
  return useQuery({
    gcTime: 60 * 60 * 1000, // 1 hour - tags don't change often
    queryFn: fetchTags,
    queryKey: tagKeys.lists(),
    staleTime: 15 * 60 * 1000, // 15 minutes - longer stale time for better UX
    placeholderData: [],
    select: (data) => data || [],
  });
};

export const useTag = (id: string) => {
  return useQuery({
    enabled: !!id,
    gcTime: 60 * 60 * 1000, // 1 hour
    queryFn: () => fetchTag(id),
    queryKey: tagKeys.detail(id),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTag,
    onError: (error) => {
      console.error('Failed to create tag:', error);
    },
    onSuccess: (newTag) => {
      // Invalidate and refetch tags list
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      
      // Add the new tag to the cache
      queryClient.setQueryData(tagKeys.detail(String(newTag.id)), newTag);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTag,
    onError: (error) => {
      console.error('Failed to update tag:', error);
    },
    onSuccess: (updatedTag) => {
      // Invalidate and refetch tags list
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      
      // Update the specific tag in cache
      queryClient.setQueryData(tagKeys.detail(String(updatedTag.id)), updatedTag);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTag,
    onError: (error) => {
      console.error('Failed to delete tag:', error);
    },
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch tags list
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      
      // Remove the deleted tag from cache
      queryClient.removeQueries({ queryKey: tagKeys.detail(deletedId) });
    },
  });
}; 