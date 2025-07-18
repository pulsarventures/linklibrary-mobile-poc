import type { Link, Tag } from '@/types/link.types';
import type { Collection } from '@/types/collection.types';
import { apiClient } from './client';

export class LinksApiService {
  // Create a new link
  static async createLink(data: Partial<Link>): Promise<Link> {
    console.log('🔐 Creating link with data:', data);
    
    const payload = {
      url: data.url,
      title: data.title || '',
      summary: data.summary || '',
      notes: data.notes || '',
      collection_id: data.collection_id,
      tag_ids: data.tag_ids || [],
      is_favorite: data.is_favorite || false,
      input_source: data.input_source || 'mobile',
    };
    
    console.log('🔐 CreateLink payload:', payload);
    
    try {
      const response = await apiClient.post<Link>('/links/', payload);
      console.log('🔐 CreateLink success response:', response);
      return response;
    } catch (error: any) {
      console.error('🔐 CreateLink error:', error);
      console.error('🔐 CreateLink error details:', {
        message: error?.message,
        stack: error?.stack,
        error
      });
      throw error;
    }
  }

  // Get all links with pagination and filtering
  static async getLinks(params: {
    limit?: number;
    skip?: number;
    sort_by?: string;
    sort_desc?: boolean;
    collection_id?: number;
    tag_ids?: number[];
    is_favorite?: boolean;
    search?: string;
  } = {}): Promise<{
    items: Link[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
  }> {
    const queryParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays by adding each value separately
          value.forEach((v) => {
            if (!queryParams[key]) queryParams[key] = [];
            queryParams[key].push(v.toString());
          });
        } else {
          queryParams[key] = value.toString();
        }
      }
    });

    return apiClient.get<{
      items: Link[];
      total: number;
      skip: number;
      limit: number;
      has_more: boolean;
    }>('/links/', queryParams);
  }

  // Update an existing link
  static async updateLink(id: string, data: Partial<Link>): Promise<Link> {
    console.log(`🔐 LinksApiService: Updating link ${id} with data:`, data);

    const payload = {
      url: data.url,
      title: data.title,
      summary: data.summary,
      notes: data.notes,
      collection_id: data.collection_id,
      tag_ids: data.tag_ids || [],
      is_favorite: data.is_favorite,
    };

    console.log(`🔐 LinksApiService: Sending payload:`, payload);

    return apiClient.put<Link>(`/links/${id}`, payload);
  }

  // Delete a link
  static async deleteLink(id: string): Promise<void> {
    console.log(`🔐 Deleting link ${id}`);
    return apiClient.delete(`/links/${id}`);
  }

  // Batch delete multiple links
  static async batchDeleteLinks(linkIds: string[]): Promise<{deleted_count: number}> {
    console.log(`🔐 Batch deleting ${linkIds.length} links`);
    return apiClient.post<{deleted_count: number}>('/links/batch-delete', { link_ids: linkIds });
  }

  // Toggle favorite status
  static async toggleFavorite(id: string): Promise<Link> {
    console.log(`🔐 Toggling favorite for link ${id}`);
    return apiClient.post<Link>(`/links/${id}/favorite`, {});
  }

  // Toggle archive status
  static async toggleArchive(id: string): Promise<Link> {
    console.log(`🔐 Toggling archive for link ${id}`);
    return apiClient.post<Link>(`/links/${id}/toggle-archive`, {});
  }

  // Get tags
  static async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<{ items: Tag[] }>('/tags/');
    return response.items || [];
  }

  // Create a new tag
  static async createTag(data: { name: string; color?: string }): Promise<Tag> {
    console.log('🔐 Creating tag');
    return apiClient.post<Tag>('/tags/', data);
  }

  // Get collections
  static async getCollections(): Promise<Collection[]> {
    const response = await apiClient.get<{ items: Collection[] }>('/collections/');
    return response.items || [];
  }

  // Create a new collection
  static async createCollection(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }): Promise<Collection> {
    console.log('🔐 Creating collection');
    return apiClient.post<Collection>('/collections/', data);
  }

  // Advanced search for links
  static async advancedSearch(params: {
    operator?: 'AND' | 'OR';
    collection_ids?: number[];
    tag_ids?: number[];
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
    keywords?: string;
    sort_by?: string;
    sort_desc?: boolean;
    input_source?: string;
  }): Promise<{
    items: Link[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
  }> {
    const payload = {
      operator: params.operator || 'OR',
      collection_ids: params.collection_ids?.length ? params.collection_ids : undefined,
      tag_ids: params.tag_ids?.length ? params.tag_ids : undefined,
      start_date: params.start_date,
      end_date: params.end_date,
      skip: params.skip || 0,
      limit: params.limit || 50,
      keywords: params.keywords,
      sort_by: params.sort_by,
      sort_desc: params.sort_desc,
      input_source: params.input_source,
    };
    
    console.log('Advanced search API request payload:', payload);
    
    return apiClient.post<{
      items: Link[];
      total: number;
      skip: number;
      limit: number;
      has_more: boolean;
    }>('/links/search', payload);
  }
}