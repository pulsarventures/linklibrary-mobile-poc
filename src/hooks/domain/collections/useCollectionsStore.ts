import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Collection, CollectionQueryParams } from '../../../types/collection.types';
import { CollectionsApiService } from '../../../services/collections-api.service';
import { isEqual } from 'lodash';
import { useAuthStore } from '../user/useAuthStore';

interface CollectionsState {
  collections: Collection[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  currentParams: CollectionQueryParams;
  lastFetchTime: number;
  activeRequests: Set<string>;

  fetchCollections: (params?: CollectionQueryParams, force?: boolean) => Promise<void>;
  createCollection: (data: { name: string; description?: string; icon?: string; color?: string }) => Promise<Collection>;
  updateCollection: (id: number, data: { name: string; description?: string; icon?: string; color?: string }) => Promise<Collection>;
  deleteCollection: (id: number) => Promise<void>;

  clearErrors: () => void;
  resetStore: () => void;
}

// Subscribe to auth store changes
let unsubscribeFromAuth: (() => void) | null = null;

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set, get) => {
      // Setup auth store subscription
      if (!unsubscribeFromAuth) {
        unsubscribeFromAuth = useAuthStore.subscribe((state) => {
          if (!state.isAuthenticated) {
            // Reset collections when user logs out
            get().resetStore();
          }
        });
      }

      return {
        collections: [],
        loading: false,
        loaded: false,
        error: null,
        currentParams: {},
        lastFetchTime: 0,
        activeRequests: new Set(),

        fetchCollections: async (params = {}, force = false) => {
          const state = get();
          const key = `fetch-collections-${JSON.stringify(params)}`;

          // Get current auth state
          const { initialized, isAuthenticated } = useAuthStore.getState();

          // Don't fetch if auth is not initialized
          if (!initialized) {
            console.log('🔍 FETCHCOLLECTIONS SKIPPED - Auth not initialized');
            return;
          }

          // Don't fetch if not authenticated
          if (!isAuthenticated) {
            console.log('🔍 FETCHCOLLECTIONS SKIPPED - User not authenticated');
            set({ error: 'Authentication required. Please log in.', loading: false });
            return;
          }

          // Don't fetch if already fetching
          if (state.activeRequests.has(key)) {
            console.log('🔍 FETCHCOLLECTIONS SKIPPED - Already fetching');
            return;
          }

          // Don't fetch if data is already loaded and params haven't changed
          if (!force && state.loaded && state.currentParams && isEqual(state.currentParams, params)) {
            console.log('🔍 FETCHCOLLECTIONS SKIPPED - Same params');
            return;
          }

          set((s) => ({
            loading: true,
            error: null,
            activeRequests: new Set([...s.activeRequests, key]),
          }));

          try {
            console.log('🔍 FETCHCOLLECTIONS START - Params:', params);
            const response = await CollectionsApiService.getCollections(params);
            set({
              collections: response.items ?? [],
              currentParams: params,
              loading: false,
              loaded: true,
              lastFetchTime: Date.now(),
            });
            console.log('🔍 FETCHCOLLECTIONS SUCCESS');
          } catch (err) {
            console.error('🔍 FETCHCOLLECTIONS ERROR:', err);
            // If auth error, reset the store
            if (err instanceof Error && 
               (err.message.includes('Authentication required') || 
                err.message.includes('Session expired'))) {
              get().resetStore();
            }
            set({ error: err instanceof Error ? err.message : 'Failed to fetch collections', loading: false });
            throw err;
          } finally {
            set((s) => {
              const r = new Set(s.activeRequests);
              r.delete(key);
              return { activeRequests: r };
            });
          }
        },

        createCollection: async (data) => {
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            throw new Error('Authentication required. Please log in.');
          }
          const newCollection = await CollectionsApiService.createCollection(data);
          set((s) => ({
            collections: [...s.collections, newCollection]
          }));
          return newCollection;
        },

        updateCollection: async (id, data) => {
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            throw new Error('Authentication required. Please log in.');
          }
          const updatedCollection = await CollectionsApiService.updateCollection(id, data);
          set((s) => ({
            collections: s.collections.map((c) => (c.id === id ? updatedCollection : c))
          }));
          return updatedCollection;
        },

        deleteCollection: async (id) => {
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            throw new Error('Authentication required. Please log in.');
          }
          await CollectionsApiService.deleteCollection(id);
          set((s) => ({
            collections: s.collections.filter((c) => c.id !== id)
          }));
        },

        clearErrors: () => set({ error: null }),

        resetStore: () => {
          set({
            collections: [],
            loading: false,
            loaded: false,
            error: null,
            currentParams: {},
            lastFetchTime: 0,
            activeRequests: new Set(),
          });
        },
      };
    },
    {
      name: 'collections-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        collections: state.collections,
        loaded: state.loaded,
        currentParams: state.currentParams,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
); 