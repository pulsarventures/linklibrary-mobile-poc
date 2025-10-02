import type { Tag, TagsQueryParams } from '@/types/tag.types';

import { TagsApiService } from '@/services/tags-api.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../user/useAuthStore';

const TAGS_QUERY_KEY = 'tags';

export function useTagsStore() {
  const queryClient = useQueryClient();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const { data: tagsData, isLoading } = useQuery({
    enabled: isAuthenticated && initialized && !authLoading, // Only run query when authenticated, initialized, and not loading
    queryFn: () => TagsApiService.getTags({ sort_by: 'name', sort_desc: false }),
    queryKey: [TAGS_QUERY_KEY],
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('Authentication required')) {
        return false;
      }
      // Retry on timeout and server errors
      if (error instanceof Error &&
          (error.message.includes('timeout') ||
           error.message.includes('Server error') ||
           error.message.includes('504') ||
           error.message.includes('502') ||
           error.message.includes('503'))) {
        return failureCount < 3;
      }
      return failureCount < 2; // Fewer retries for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createTagMutation = useMutation({
    mutationFn: (data: Pick<Tag, 'color' | 'name'>) => {
      console.log('🏷️ Tag store: Starting tag creation:', data);
      return TagsApiService.createTag(data);
    },
    onError: (error) => {
      console.error('❌ Tag store: Failed to create tag:', error);
    },
    onSuccess: (newTag) => {
      console.log('✅ Tag store: Tag created successfully after potential retry:', newTag);
      // Invalidate and refetch the tags query
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      // Also update the cache optimistically
      queryClient.setQueryData([TAGS_QUERY_KEY], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: [...oldData.items, newTag],
          total: oldData.total + 1,
        };
      });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ data, id }: { data: Pick<Tag, 'color' | 'name'>; id: number; }) =>
      TagsApiService.updateTag(id, data),
    onError: (error) => {
      console.error('❌ Failed to update tag:', error);
    },
    onSuccess: (updatedTag) => {
      console.log('✅ Tag updated successfully:', updatedTag);
      // Invalidate and refetch the tags query
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      // Also update the cache optimistically
      queryClient.setQueryData([TAGS_QUERY_KEY], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((tag: Tag) => 
            tag.id === updatedTag.id ? updatedTag : tag
          ),
        };
      });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => TagsApiService.deleteTag(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: [TAGS_QUERY_KEY] });
      
      // Snapshot the previous value for rollback
      const previousTags = queryClient.getQueryData([TAGS_QUERY_KEY]);
      
      // Optimistically remove the tag immediately
      queryClient.setQueryData([TAGS_QUERY_KEY], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.filter((tag: Tag) => tag.id !== deletedId),
          total: Math.max(0, oldData.total - 1),
        };
      });
      
      // Return context for rollback
      return { previousTags };
    },
    onError: (error, deletedId, context) => {
      console.error('❌ Failed to delete tag:', error);
      // Rollback to previous data on error
      if (context?.previousTags) {
        queryClient.setQueryData([TAGS_QUERY_KEY], context.previousTags);
      }
    },
    onSuccess: (_, deletedId) => {
      console.log('✅ Tag deleted successfully:', deletedId);
      // Invalidate to ensure consistency with backend
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });

  return {
    createTag: createTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,
    isCreating: createTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
    isLoading,
    isUpdating: updateTagMutation.isPending,
    tags: tagsData?.items || [],
    total: tagsData?.total || 0,
    updateTag: updateTagMutation.mutate,
  };
} 