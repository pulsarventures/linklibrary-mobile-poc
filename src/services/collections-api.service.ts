import type { Collection, CollectionQueryParams as CollectionQueryParameters } from '../types/collection.types';

import { apiClient } from './api/client';

export const CollectionsApiService = {
  async createCollection(data: { color?: string; description?: string; icon?: string; name: string; }): Promise<Collection> {
    return apiClient.post('/collections', {
      color: data.color || 'gray',
      description: data.description?.trim(),
      icon: data.icon,
      name: data.name.trim()
    });
  },

  async deleteCollection(id: number): Promise<void> {
    return apiClient.delete(`/collections/${id}`);
  },

  async getCollection(id: number): Promise<Collection> {
    return apiClient.get(`/collections/${id}`);
  },

  async getCollections(parameters: CollectionQueryParameters = {}): Promise<{
    has_more: boolean;
    items: Collection[];
    limit: number;
    skip: number;
    total: number;
  }> {
    return apiClient.get('/collections', parameters);
  },

  async updateCollection(id: number, data: { color?: string; description?: string; icon?: string; name: string; }): Promise<Collection> {
    return apiClient.put(`/collections/${id}`, {
      color: data.color || 'gray',
      description: data.description?.trim(),
      icon: data.icon,
      name: data.name.trim()
    });
  },
}; 