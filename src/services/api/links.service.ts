import type { Collection } from '@/types/collection.types';
import type { Link, Tag } from '@/types/link.types';

import { apiClient } from './client';

export const LinksApiService = {
  // Create a new link
  async createLink(data: Partial<Link>): Promise<Link> {
    console.log('🔐 Creating link with data:', data);
    
    const payload = {
      collection_id: data.collection_id,
      input_source: data.input_source || 'mobile',
      is_favorite: data.is_favorite || false,
      notes: data.notes || '',
      summary: data.summary || '',
      tag_ids: data.tag_ids || [],
      title: data.title || '',
      url: data.url,
    };
    
    console.log('🔐 CreateLink payload:', payload);
    
    try {
      const response = await apiClient.post<Link>('/links/', payload);
      console.log('🔐 CreateLink success response:', response);
      return response;
    } catch (error: any) {
      console.error('🔐 CreateLink error:', error);
      console.error('🔐 CreateLink error details:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
      throw error;
    }
  },

  // Get all links with pagination and filtering
  async getLinks(parameters: {
    collection_id?: number;
    is_favorite?: boolean;
    limit?: number;
    search?: string;
    skip?: number;
    sort_by?: string;
    sort_desc?: boolean;
    tag_id?: number;        // Single tag filter
    tag_ids?: number[];     // Multiple tags filter (for advanced search)
  } = {}): Promise<{
    has_more: boolean;
    items: Link[];
    limit: number;
    skip: number;
    total: number;
  }> {
    console.log('🔍 LinksApiService.getLinks called with parameters:', parameters);
    
    const result = await apiClient.get<{
      has_more: boolean;
      items: Link[];
      limit: number;
      skip: number;
      total: number;
    }>('/links/', parameters);
    
    console.log('🔍 LinksApiService.getLinks result:', {
      itemsCount: result.items?.length || 0,
      total: result.total,
      hasMore: result.has_more
    });
    
    return result;
  },

  // Update an existing link
  async updateLink(id: string, data: Partial<Link>): Promise<Link> {
    console.log(`🔐 LinksApiService: Updating link ${id} with data:`, data);

    const payload = {
      collection_id: data.collection_id,
      is_favorite: data.is_favorite,
      notes: data.notes,
      summary: data.summary,
      tag_ids: data.tag_ids || [],
      title: data.title,
      url: data.url,
    };

    console.log(`🔐 LinksApiService: Sending payload:`, payload);

    return apiClient.put<Link>(`/links/${id}`, payload);
  },

  // Delete a link
  async deleteLink(id: string): Promise<void> {
    console.log(`🔐 Deleting link ${id}`);
    return apiClient.delete(`/links/${id}`);
  },

  // Batch delete multiple links
  async batchDeleteLinks(linkIds: string[]): Promise<{deleted_count: number}> {
    console.log(`🔐 Batch deleting ${linkIds.length} links`);
    return apiClient.post<{deleted_count: number}>('/links/batch-delete', { link_ids: linkIds });
  },

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<Link> {
    console.log(`🔐 Toggling favorite for link ${id}`);
    return apiClient.post<Link>(`/links/${id}/favorite`, {});
  },

  // Toggle archive status
  async toggleArchive(id: string): Promise<Link> {
    console.log(`🔐 Toggling archive for link ${id}`);
    return apiClient.post<Link>(`/links/${id}/toggle-archive`, {});
  },

  // Get tags
  async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<{ items: Tag[] }>('/tags/');
    return response.items || [];
  },

  // Create a new tag
  async createTag(data: { color?: string; name: string; }): Promise<Tag> {
    console.log('🔐 Creating tag');
    return apiClient.post<Tag>('/tags/', data);
  },

  // Get collections
  async getCollections(): Promise<Collection[]> {
    const response = await apiClient.get<{ items: Collection[] }>('/collections/');
    return response.items || [];
  },

  // Create a new collection
  async createCollection(data: {
    color?: string;
    description?: string;
    icon?: string;
    name: string;
  }): Promise<Collection> {
    console.log('🔐 Creating collection');
    return apiClient.post<Collection>('/collections/', data);
  },

  // Advanced search for links
  async advancedSearch(parameters: {
    collection_ids?: number[];
    end_date?: string;
    input_source?: string;
    keywords?: string;
    limit?: number;
    operator?: 'AND' | 'OR';
    skip?: number;
    sort_by?: string;
    sort_desc?: boolean;
    start_date?: string;
    tag_ids?: number[];
  }): Promise<{
    has_more: boolean;
    items: Link[];
    limit: number;
    skip: number;
    total: number;
  }> {
    const payload = {
      collection_ids: parameters.collection_ids?.length ? parameters.collection_ids : undefined,
      end_date: parameters.end_date,
      input_source: parameters.input_source,
      keywords: parameters.keywords,
      limit: parameters.limit || 50,
      operator: parameters.operator || 'OR',
      skip: parameters.skip || 0,
      sort_by: parameters.sort_by,
      sort_desc: parameters.sort_desc,
      start_date: parameters.start_date,
      tag_ids: parameters.tag_ids?.length ? parameters.tag_ids : undefined,
    };
    
    console.log('Advanced search API request payload:', payload);
    
    return apiClient.post<{
      has_more: boolean;
      items: Link[];
      limit: number;
      skip: number;
      total: number;
    }>('/links/search', payload);
  },
};