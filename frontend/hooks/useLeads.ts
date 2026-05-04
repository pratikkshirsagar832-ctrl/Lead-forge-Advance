import { useEffect } from 'react';
import { useLeadsStore } from '@/stores/leadsStore';

export function useLeads(searchId?: string) {
  const { leads, total, isLoading, filters, fetchLeads } = useLeadsStore();

  useEffect(() => {
    if (searchId) {
      fetchLeads({ search_id: searchId, page: 1 });
    } else {
      fetchLeads({ page: 1 });
    }
  }, [searchId]);

  return {
    leads,
    total,
    isLoading,
    filters,
    fetchLeads
  };
}
