import type { Collection } from '@/types/collection.types';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/services/api/client';

// Query keys
export const collectionKeys = {
  all: ['collections'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  list: (filters: any) => [...collectionKeys.lists(), { filters }] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
};

// Fetch collections
const fetchCollections = async (): Promise<Collection[]> => {
  return apiClient.get<Collection[]>('/collections');
};

// Fetch single collection
const fetchCollection = async (id: string): Promise<Collection> => {
  return apiClient.get<Collection>(`/collections/${id}`);
};

// Create collection
const createCollection = async (collectionData: Partial<Collection>): Promise<Collection> => {
  return apiClient.post<Collection>('/collections', collectionData);
};

// Update collection
const updateCollection = async ({ id, ...collectionData }: { id: string } & Partial<Collection>): Promise<Collection> => {
  return apiClient.put<Collection>(`/collections/${id}`, collectionData);
};

// Delete collection
const deleteCollection = async (id: string): Promise<void> => {
  return apiClient.delete(`/collections/${id}`);
};

// React Query hooks
export const useCollections = () => {
  return useQuery({
    gcTime: 10 * 60 * 1000, // 10 minutes
    queryFn: fetchCollections,
    queryKey: collectionKeys.lists(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCollection = (id: string) => {
  return useQuery({
    enabled: !!id,
    gcTime: 10 * 60 * 1000, // 10 minutes
    queryFn: () => fetchCollection(id),
    queryKey: collectionKeys.detail(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCollection,
    onError: (error) => {
      console.error('Failed to create collection:', error);
    },
    onSuccess: (newCollection) => {
      // Invalidate and refetch collections list
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      
      // Add the new collection to the cache
      queryClient.setQueryData(collectionKeys.detail(String(newCollection.id)), newCollection);
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCollection,
    onError: (error) => {
      console.error('Failed to update collection:', error);
    },
    onSuccess: (updatedCollection) => {
      // Invalidate and refetch collections list
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      
      // Update the specific collection in cache
      queryClient.setQueryData(collectionKeys.detail(String(updatedCollection.id)), updatedCollection);
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCollection,
    onError: (error) => {
      console.error('Failed to delete collection:', error);
    },
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch collections list
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      
      // Remove the deleted collection from cache
      queryClient.removeQueries({ queryKey: collectionKeys.detail(deletedId) });
    },
  });
}; 