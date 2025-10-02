import type { Link } from '@/types/link.types';

import { apiClient } from './api/client';

type MetadataResponse = {
  title: string;
  favicon_url: string;
  link: string;
  summary: string;
  thumbnail_url: string;
}

export class LinksApiService {
  private static async makeRequest<T>(
    endpoint: string,
    method: 'DELETE' | 'GET' | 'POST' | 'PUT',
    data?: any
  ): Promise<T> {
    try {
      switch (method) {
        case 'DELETE': {
          await apiClient.delete(endpoint);
          return {} as T;
        }
        case 'GET': {
          return await apiClient.get<T>(endpoint);
        }
        case 'POST': {
          // Only pass data if it's explicitly provided
          return await (data === undefined ? apiClient.post<T>(endpoint) : apiClient.post<T>(endpoint, data));
        }
        case 'PUT': {
          return await apiClient.put<T>(endpoint, data || {});
        }
        default: {
          throw new Error(`Unsupported method: ${method}`);
        }
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
    if (__DEV__) {
      console.log(`🔐 Updating link ${id} with data:`, data);
    }
    return apiClient.put<Link>(`/links/${id}`, {
      collection_id: data.collection_id,
      is_favorite: data.is_favorite,
      notes: data.notes,
      summary: data.summary,
      tag_ids: data.tag_ids || [],
      title: data.title,
      url: data.url,
    });
  }

  // Extract metadata from URL using backend API
  static async extractMetadata(url: string): Promise<MetadataResponse> {
    try {
      const response = await this.makeRequest<MetadataResponse>(
        `/links/metadata`,
        'POST',
        { url }  // Send URL in the request body as JSON
      );
      console.log('🔐 Metadata extraction response:', response);
      return response;
    } catch (error: any) {
      console.error('🔐 Metadata extraction error:', error);
      throw error;
    }
  }
}

export const linksApiService = new LinksApiService(); 