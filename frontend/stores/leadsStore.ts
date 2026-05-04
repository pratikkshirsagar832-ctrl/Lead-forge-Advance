import { create } from 'zustand';
import { api } from '@/lib/api';
import { Lead, LeadFilter } from '@/types/lead';

interface LeadsState {
  leads: Lead[];
  total: number;
  filters: LeadFilter;
  isLoading: boolean;
  fetchLeads: (newFilters?: Partial<LeadFilter>) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  resetFilters: () => void;
}

const defaultFilters: LeadFilter = {
  page: 1,
  per_page: 25,
  sort_by: 'date',
  sort_dir: 'desc',
  status: 'All'
};

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  total: 0,
  filters: defaultFilters,
  isLoading: false,
  fetchLeads: async (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ filters, isLoading: true });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      const { data } = await api.get(`/api/leads?${params.toString()}`);
      set({ leads: data.data, total: data.total });
    } finally {
      set({ isLoading: false });
    }
  },
  updateLead: async (id, updateData) => {
    // Optimistic update
    const prevLeads = get().leads;
    set({ leads: prevLeads.map(l => l.id === id ? { ...l, ...updateData } : l) });
    try {
      await api.patch(`/api/leads/${id}`, updateData);
    } catch (e) {
      // Revert on error
      set({ leads: prevLeads });
      throw e;
    }
  },
  resetFilters: () => {
    get().fetchLeads(defaultFilters);
  }
}));
