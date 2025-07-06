import type { Tag, TagsQueryParams, TagsResponse } from '@/types/tag.types';
import { apiClient } from './api/client';

export class TagsApiService {
  static async getTags(params: TagsQueryParams = {}): Promise<TagsResponse> {
    return apiClient.get('/tags', params);
  }

  static async createTag(data: Pick<Tag, 'name' | 'color'>): Promise<Tag> {
    return apiClient.post('/tags', data);
  }

  static async updateTag(id: number, data: Pick<Tag, 'name' | 'color'>): Promise<Tag> {
    return apiClient.put(`/tags/${id}`, data);
  }

  static async deleteTag(id: number): Promise<void> {
    return apiClient.delete(`/tags/${id}`);
  }
} 