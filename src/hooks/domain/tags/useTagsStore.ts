import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tag, TagsQueryParams } from '@/types/tag.types';
import { TagsApiService } from '@/services/tags-api.service';
import { useAuthStore } from '../user/useAuthStore';

const TAGS_QUERY_KEY = 'tags';

export function useTagsStore() {
  const queryClient = useQueryClient();
  const { isAuthenticated, initialized, isLoading: authLoading } = useAuthStore();

  const { data: tagsData, isLoading } = useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: () => TagsApiService.getTags({ sort_by: 'name', sort_desc: false }),
    enabled: isAuthenticated && initialized && !authLoading, // Only run query when authenticated, initialized, and not loading
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
    mutationFn: (data: Pick<Tag, 'name' | 'color'>) => TagsApiService.createTag(data),
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
    onError: (error) => {
      console.error('❌ Failed to create tag:', error);
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Pick<Tag, 'name' | 'color'> }) =>
      TagsApiService.updateTag(id, data),
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
    onError: (error) => {
      console.error('❌ Failed to update tag:', error);
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => TagsApiService.deleteTag(id),
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
    onError: (error) => {
      console.error('❌ Failed to delete tag:', error);
    },
  });

  return {
    tags: tagsData?.items || [],
    total: tagsData?.total || 0,
    isLoading,
    createTag: createTagMutation.mutate,
    updateTag: updateTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,
    isCreating: createTagMutation.isPending,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
  };
} 