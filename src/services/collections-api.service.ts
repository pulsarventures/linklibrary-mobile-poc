import type { Collection, CollectionQueryParams } from '../types/collection.types';
import { apiClient } from './api/client';

export class CollectionsApiService {
  static async getCollections(params: CollectionQueryParams = {}): Promise<{
    items: Collection[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
  }> {
    return apiClient.get('/collections/', params);
  }

  static async getCollection(id: number): Promise<Collection> {
    return apiClient.get(`/collections/${id}`);
  }

  static async createCollection(data: { name: string; description?: string; icon?: string; color?: string }): Promise<Collection> {
    return apiClient.post('/collections/', {
      name: data.name.trim(),
      description: data.description?.trim(),
      icon: data.icon,
      color: data.color || 'gray'
    });
  }

  static async updateCollection(id: number, data: { name: string; description?: string; icon?: string; color?: string }): Promise<Collection> {
    return apiClient.put(`/collections/${id}`, {
      name: data.name.trim(),
      description: data.description?.trim(),
      icon: data.icon,
      color: data.color || 'gray'
    });
  }

  static async deleteCollection(id: number): Promise<void> {
    return apiClient.delete(`/collections/${id}`);
  }
} 