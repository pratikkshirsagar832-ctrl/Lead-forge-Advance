'use client';

import { Search } from '@/types/search';
import { motion } from 'framer-motion';
import { Loader2, XCircle } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import toast from 'react-hot-toast';

interface SearchProgressProps {
  search: Search;
}

export default function SearchProgress({ search }: SearchProgressProps) {
  const { cancelSearch } = useSearchStore();

  const handleCancel = async () => {
    try {
      await cancelSearch(search.id);
      toast.success('Search cancelled');
    } catch (err) {
      toast.error('Failed to cancel search');
    }
  };

  return (
    <div className="glassmorphism bg-black/60 p-8 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-white mb-2">
        Searching {search.niche} in {search.location}
      </h2>
      <p className="text-[var(--color-light)] mb-8">{search.message || 'Initializing...'}</p>

      <div className="relative h-4 bg-black/40 rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-dark)] to-[var(--color-mid)]"
          initial={{ width: 0 }}
          animate={{ width: `${search.progress_percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex justify-between text-sm font-medium mb-12">
        <span className="text-[var(--color-light)]">{search.progress_percent}% Complete</span>
        <span className="text-[var(--color-mid)]">
          <motion.span
            key={search.leads_collected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {search.leads_collected}
          </motion.span> leads collected
        </span>
      </div>

      {(search.status === 'queued' || search.status === 'running') && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCancel}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
        >
          <XCircle size={20} />
          Cancel Search
        </motion.button>
      )}
    </div>
  );
}
