import { create } from 'zustand';

type SharedUrlState = {
  clearSharedUrl: () => void;
  setSharedUrl: (url: null | string) => void;
  sharedUrl: null | string;
}

export const useSharedUrlStore = create<SharedUrlState>((set) => ({
  clearSharedUrl: () => { set({ sharedUrl: null }); },
  setSharedUrl: (url: null | string) => { set({ sharedUrl: url }); },
  sharedUrl: null,
})); 