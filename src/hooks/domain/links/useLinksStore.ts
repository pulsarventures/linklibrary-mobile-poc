import type { Link } from '@/types/link.types';

import { create } from 'zustand';

import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/services/api/client';

import { useAuthStore } from '../user/useAuthStore';

type LinksState = {
  addLink: (link: Link) => void;
  error: Error | null;
  fetchLinks: () => Promise<void>;
  isLoading: boolean;
  links: Link[];
  setLinks: (links: Link[]) => void;
  total: number;
}

export const useLinksStore = create<LinksState>((set, get) => ({
  addLink: (link: Link) => {
    const { links } = get();
    set({ links: [link, ...links], total: links.length + 1 });
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
  setLinks: (links: Link[]) => {
    set({ links, total: links.length });
  },
  total: 0,
})); 