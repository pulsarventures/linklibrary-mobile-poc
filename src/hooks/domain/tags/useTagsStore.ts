import type { Tag, TagsQueryParams } from '@/types/tag.types';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TagsApiService } from '@/services/tags-api.service';

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
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createTagMutation = useMutation({
    mutationFn: (data: Pick<Tag, 'color' | 'name'>) => TagsApiService.createTag(data),
    onError: (error) => {
      console.error('❌ Failed to create tag:', error);
    },
    onSuccess: (newTag) => {
      console.log('✅ Tag created successfully:', newTag);
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
    onError: (error) => {
      console.error('❌ Failed to delete tag:', error);
    },
    onSuccess: (_, deletedId) => {
      console.log('✅ Tag deleted successfully:', deletedId);
      // Invalidate and refetch the tags query
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      // Also update the cache optimistically
      queryClient.setQueryData([TAGS_QUERY_KEY], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.filter((tag: Tag) => tag.id !== deletedId),
          total: oldData.total - 1,
        };
      });
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