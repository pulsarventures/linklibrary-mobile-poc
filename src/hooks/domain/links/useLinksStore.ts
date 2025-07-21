import { create } from 'zustand';
import type { Link } from '@/types/link.types';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '../user/useAuthStore';

interface LinksState {
  links: Link[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  fetchLinks: () => Promise<void>;
  setLinks: (links: Link[]) => void;
  addLink: (link: Link) => void;
}

export const useLinksStore = create<LinksState>((set, get) => ({
  links: [],
  total: 0,
  isLoading: false,
  error: null,
  fetchLinks: async () => {
    const { isAuthenticated, initialized } = useAuthStore.getState();
    
    // Don't fetch if auth is not initialized or user is not authenticated
    if (!initialized || !isAuthenticated) {
      console.log('🔍 FETCHLINKS SKIPPED - Auth not ready or user not authenticated');
      return;
    }

    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.get<{
        items: Link[];
        total: number;
        skip: number;
        limit: number;
        has_more: boolean;
      }>(API_ENDPOINTS.links.list, {
        params: {
          sort_by: 'created_at',
          sort_desc: true,
          skip: 0,
          limit: 100,
        },
      });

      set({ 
        links: response.items,
        total: response.total,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch links:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  setLinks: (links: Link[]) => {
    set({ links, total: links.length });
  },
  addLink: (link: Link) => {
    const { links } = get();
    set({ links: [link, ...links], total: links.length + 1 });
  },
})); 