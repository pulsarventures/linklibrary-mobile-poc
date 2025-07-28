import type { Collection, CollectionQueryParams as CollectionQueryParameters } from '../../../types/collection.types';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isEqual } from 'lodash';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CollectionsApiService } from '../../../services/collections-api.service';
import { useAuthStore } from '../user/useAuthStore';

type CollectionsState = {
  activeRequests: Set<string>;
  clearErrors: () => void;
  collections: Collection[];
  createCollection: (data: { color?: string; description?: string; icon?: string; name: string; }) => Promise<Collection>;
  currentParams: CollectionQueryParameters;
  deleteCollection: (id: number) => Promise<void>;
  error: null | string;

  fetchCollections: (parameters?: CollectionQueryParameters, force?: boolean) => Promise<void>;
  lastFetchTime: number;
  loaded: boolean;
  loading: boolean;

  resetStore: () => void;
  updateCollection: (id: number, data: { color?: string; description?: string; icon?: string; name: string; }) => Promise<Collection>;
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
        activeRequests: new Set(),
        clearErrors: () => { set({ error: null }); },
        collections: [],
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
        currentParams: {},
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
        error: null,

        fetchCollections: async (parameters = {}, force = false) => {
          const state = get();
          const key = `fetch-collections-${JSON.stringify(parameters)}`;

          // Get current auth state
          const { initialized, isAuthenticated } = useAuthStore.getState();

          // Don't fetch if auth is not initialized
          if (!initialized) {
            // Auth not initialized
            return;
          }

          // Don't fetch if not authenticated
          if (!isAuthenticated) {
            // User not authenticated
            set({ error: 'Authentication required. Please log in.', loading: false });
            return;
          }

          // Don't fetch if already fetching
          if (state.activeRequests.has(key)) {
            // Already fetching
            return;
          }

          // Don't fetch if data is already loaded and params haven't changed and data is fresh
          const isDataFresh = Date.now() - state.lastFetchTime < 2 * 60 * 1000; // 2 minutes
          if (!force && state.loaded && state.currentParams && isEqual(state.currentParams, parameters) && isDataFresh) {
            // Same params and fresh data, skipping
            return;
          }

          set((s) => ({
            activeRequests: new Set([key, ...s.activeRequests]),
            error: null,
            loading: true,
          }));

          try {
            // Fetching collections
            const response = await CollectionsApiService.getCollections(parameters);
            set({
              collections: response.items ?? [],
              currentParams: parameters,
              lastFetchTime: Date.now(),
              loaded: true,
              loading: false,
            });
            // Fetch successful
          } catch (error) {
            console.error('🔍 FETCHCOLLECTIONS ERROR:', error);
            // If auth error, reset the store
            if (error instanceof Error && 
               (error.message.includes('Authentication required') || 
                error.message.includes('Session expired'))) {
              get().resetStore();
            }
            set({ error: error instanceof Error ? error.message : 'Failed to fetch collections', loading: false });
            throw error;
          } finally {
            set((s) => {
              const r = new Set(s.activeRequests);
              r.delete(key);
              return { activeRequests: r };
            });
          }
        },

        lastFetchTime: 0,

        loaded: false,

        loading: false,

        resetStore: () => {
          set({
            activeRequests: new Set(),
            collections: [],
            currentParams: {},
            error: null,
            lastFetchTime: 0,
            loaded: false,
            loading: false,
          });
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
      };
    },
    {
      name: 'collections-store',
      partialize: (state) => ({
        collections: state.collections,
        currentParams: state.currentParams,
        lastFetchTime: state.lastFetchTime,
        loaded: state.loaded,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 