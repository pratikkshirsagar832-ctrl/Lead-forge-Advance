import { create } from 'zustand';
import { api } from '@/lib/api';
import { Search } from '@/types/search';

interface SearchState {
  searches: Search[];
  currentSearch: Search | null;
  isLoading: boolean;
  createSearch: (niche: string, location: string) => Promise<Search>;
  fetchSearches: () => Promise<void>;
  fetchSearch: (id: string) => Promise<void>;
  cancelSearch: (id: string) => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searches: [],
  currentSearch: null,
  isLoading: false,
  createSearch: async (niche, location) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/api/searches', { niche, location });
      return data;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSearches: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/api/searches');
      set({ searches: data.data || [] });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSearch: async (id) => {
    const { data } = await api.get(`/api/searches/${id}`);
    set({ currentSearch: data });
  },
  cancelSearch: async (id) => {
    await api.post(`/api/searches/${id}/cancel`);
    await get().fetchSearch(id);
  }
}));
