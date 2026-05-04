'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useSearchStore } from '@/stores/searchStore';
import { useRouter } from 'next/navigation';

const searchSchema = z.object({
  niche: z.string().min(1, 'Niche is required'),
  location: z.string().min(1, 'Location is required'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function NewSearchForm() {
  const { isNewSearchOpen, closeNewSearch } = useUIStore();
  const { createSearch, isLoading } = useSearchStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema)
  });

  const onSubmit = async (data: SearchFormValues) => {
    const search = await createSearch(data.niche, data.location);
    closeNewSearch();
    reset();
    router.push(`/searches/${search.id}`);
  };

  if (!isNewSearchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeNewSearch}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glassmorphism bg-black/60 p-8 w-full max-w-lg relative z-10"
        >
          <button
            onClick={closeNewSearch}
            className="absolute right-4 top-4 text-[var(--color-light)] hover:text-white"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">New Search</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-light)] mb-1">Niche</label>
              <input
                {...register('niche')}
                className="w-full bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mid)]"
                placeholder="e.g. Dentists, Plumbers"
              />
              {errors.niche && <p className="text-red-400 text-sm mt-1">{errors.niche.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-light)] mb-1">Location</label>
              <input
                {...register('location')}
                className="w-full bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mid)]"
                placeholder="e.g. New York, London"
              />
              {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--color-dark)] to-[var(--color-mid)] text-[var(--color-darkest)] font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <SearchIcon size={20} />}
              {isLoading ? 'Starting Search...' : 'Start Search'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
