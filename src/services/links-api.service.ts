import type { Link } from '@/types/link.types';
import { apiClient } from './api/client';
import { secureStorageService } from './secureStorage';

export class LinksApiService {
  private static async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  ): Promise<T> {
    try {
      switch (method) {
        case 'DELETE':
          await apiClient.delete(endpoint);
          return {} as T;
        case 'GET':
          return await apiClient.get<T>(endpoint);
        case 'POST':
          return await apiClient.post<T>(endpoint);
        case 'PUT':
          return await apiClient.put<T>(endpoint, {});
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error) {
      const printable = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
      console.error('Links API Error:', printable);
      throw error;
    }
  }

  // Delete a link
  static async deleteLink(id: string): Promise<void> {
    console.log(`🔐 Deleting link ${id}`);
    return this.makeRequest<void>(`/links/${id}`, 'DELETE');
  }

  // Toggle favorite status
  static async toggleFavorite(id: string): Promise<Link> {
    console.log(`🔐 Toggling favorite for link ${id}`);
    return this.makeRequest<Link>(`/links/${id}/favorite`, 'POST');
  }

  // Update a link
  static async updateLink(id: string, data: Partial<Link>): Promise<Link> {
    console.log(`🔐 Updating link ${id} with data:`, data);
    return apiClient.put<Link>(`/links/${id}`, {
      url: data.url,
      title: data.title,
      summary: data.summary,
      notes: data.notes,
      collection_id: data.collection_id,
      tag_ids: data.tag_ids || [],
      is_favorite: data.is_favorite,
    });
  }
}

export const linksApiService = new LinksApiService(); 