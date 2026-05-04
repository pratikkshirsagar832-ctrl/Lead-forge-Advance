import { create } from 'zustand';
import { Lead } from '@/types/lead';

interface UIState {
  selectedLead: Lead | null;
  isLeadDetailOpen: boolean;
  isNewSearchOpen: boolean;
  openLeadDetail: (lead: Lead) => void;
  closeLeadDetail: () => void;
  openNewSearch: () => void;
  closeNewSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedLead: null,
  isLeadDetailOpen: false,
  isNewSearchOpen: false,
  openLeadDetail: (lead) => set({ selectedLead: lead, isLeadDetailOpen: true }),
  closeLeadDetail: () => set({ isLeadDetailOpen: false }),
  openNewSearch: () => set({ isNewSearchOpen: true }),
  closeNewSearch: () => set({ isNewSearchOpen: false })
}));
