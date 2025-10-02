import type { Tag, TagsQueryParams, TagsResponse } from '@/types/tag.types';

import { apiClient } from './api/client';

export const TagsApiService = {
  async createTag(data: Pick<Tag, 'color' | 'name'>): Promise<Tag> {
    console.log('🏷️ Creating tag via API:', data);
    return apiClient.post('/tags', data);
  },

  async deleteTag(id: number): Promise<void> {
    return apiClient.delete(`/tags/${id}`);
  },

  async getTags(parameters: TagsQueryParams = {}): Promise<TagsResponse> {
    return apiClient.get('/tags', parameters);
  },

  async updateTag(id: number, data: Pick<Tag, 'color' | 'name'>): Promise<Tag> {
    return apiClient.put(`/tags/${id}`, data);
  },
}; 