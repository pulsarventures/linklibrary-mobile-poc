import { queryClient } from '@/App';

export const clearQueryCache = () => {
  try {
    queryClient.clear();
    console.log('🗑️ Cleared TanStack Query cache');
  } catch (error) {
    console.error('Failed to clear query cache:', error);
  }
};