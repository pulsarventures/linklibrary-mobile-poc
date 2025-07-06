import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tag, TagsQueryParams } from '@/types/tag.types';
import { TagsApiService } from '@/services/tags-api.service';

const TAGS_QUERY_KEY = 'tags';

export function useTagsStore() {
  const queryClient = useQueryClient();

  const { data: tagsData, isLoading } = useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: () => TagsApiService.getTags({ sort_by: 'name', sort_desc: false }),
  });

  const createTagMutation = useMutation({
    mutationFn: (data: Pick<Tag, 'name' | 'color'>) => TagsApiService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Pick<Tag, 'name' | 'color'> }) =>
      TagsApiService.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => TagsApiService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
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