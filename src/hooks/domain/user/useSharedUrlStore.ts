import { create } from 'zustand';

interface SharedUrlState {
  sharedUrl: string | null;
  setSharedUrl: (url: string | null) => void;
  clearSharedUrl: () => void;
}

export const useSharedUrlStore = create<SharedUrlState>((set) => ({
  sharedUrl: null,
  setSharedUrl: (url: string | null) => set({ sharedUrl: url }),
  clearSharedUrl: () => set({ sharedUrl: null }),
})); 