import { useEffect, useState, useRef } from 'react';
import { useSearchStore } from '@/stores/searchStore';

export function usePolling(searchId: string, interval = 2000) {
  const { currentSearch, fetchSearch } = useSearchStore();
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!searchId) return;

    const poll = async () => {
      try {
        await fetchSearch(searchId);
      } catch (err) {
        setError(err as Error);
        setIsPolling(false);
      }
    };

    poll(); // Initial fetch
    setIsPolling(true);

    intervalRef.current = setInterval(() => {
      poll();
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [searchId, interval, fetchSearch]);

  // Stop polling if status is terminal
  useEffect(() => {
    if (currentSearch) {
      const terminalStatuses = ['completed', 'failed', 'partial', 'cancelled'];
      if (terminalStatuses.includes(currentSearch.status)) {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }
  }, [currentSearch]);

  return { search: currentSearch, isPolling, error };
}
