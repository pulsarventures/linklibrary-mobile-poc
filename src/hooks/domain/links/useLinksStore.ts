import type { Link } from '@/types/link.types';

import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/services/api/client';
import { LinksApiService } from '@/services/api/links.service';
import { create } from 'zustand';

import { useAuthStore } from '../user/useAuthStore';

type LinksState = {
  addLink: (link: Link) => void;
  clearError: () => void;
  createLink: (data: Partial<Link>) => Promise<Link>;
  deleteLink: (id: string) => Promise<void>;
  error: Error | null;
  fetchLinks: () => Promise<void>;
  isLoading: boolean;
  links: Link[];
  resetStore: () => void;
  setLinks: (links: Link[]) => void;
  total: number;
  updateLink: (id: string, data: Partial<Link>) => Promise<Link>;
}

export const useLinksStore = create<LinksState>((set, get) => ({
  addLink: (link: Link) => {
    const { links } = get();
    set({ links: [link, ...links], total: links.length + 1 });
  },
  clearError: () => {
    set({ error: null });
  },
  createLink: async (data: Partial<Link>) => {
    const { initialized, isAuthenticated } = useAuthStore.getState();
    if (!initialized || !isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      set({ error: null });
      const newLink = await LinksApiService.createLink(data);
      
      // Add to store optimistically
      const { links } = get();
      set({ links: [newLink, ...links], total: links.length + 1 });
      
      return newLink;
    } catch (error) {
      console.error('Failed to create link:', error);
      set({ error: error as Error });
      throw error;
    }
  },
  deleteLink: async (id: string) => {
    const { initialized, isAuthenticated } = useAuthStore.getState();
    if (!initialized || !isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      set({ error: null });
      await LinksApiService.deleteLink(id);
      
      // Remove from store
      const { links } = get();
      set({ 
        links: links.filter(link => link.id !== id),
        total: links.length - 1 
      });
    } catch (error) {
      console.error('Failed to delete link:', error);
      set({ error: error as Error });
      throw error;
    }
  },
  error: null,
  fetchLinks: async () => {
    const { initialized, isAuthenticated } = useAuthStore.getState();
    
    // Don't fetch if auth is not initialized or user is not authenticated
    if (!initialized || !isAuthenticated) {
      console.log('🔍 FETCHLINKS SKIPPED - Auth not ready or user not authenticated');
      return;
    }

    try {
      set({ error: null, isLoading: true });
      
      const response = await apiClient.get<{
        has_more: boolean;
        items: Link[];
        limit: number;
        skip: number;
        total: number;
      }>(API_ENDPOINTS.links.list, {
        params: {
          limit: 100,
          skip: 0,
          sort_by: 'created_at',
          sort_desc: true,
        },
      });

      set({ 
        isLoading: false,
        links: response.items,
        total: response.total 
      });
    } catch (error) {
      console.error('Failed to fetch links:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  isLoading: false,
  links: [],
  resetStore: () => {
    set({
      error: null,
      isLoading: false,
      links: [],
      total: 0,
    });
  },
  setLinks: (links: Link[]) => {
    set({ links, total: links.length });
  },
  total: 0,
  updateLink: async (id: string, data: Partial<Link>) => {
    const { initialized, isAuthenticated } = useAuthStore.getState();
    if (!initialized || !isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      set({ error: null });
      const updatedLink = await LinksApiService.updateLink(id, data);
      
      // Update in store
      const { links } = get();
      set({ 
        links: links.map(link => link.id === id ? updatedLink : link)
      });
      
      return updatedLink;
    } catch (error) {
      console.error('Failed to update link:', error);
      set({ error: error as Error });
      throw error;
    }
  },
})); 