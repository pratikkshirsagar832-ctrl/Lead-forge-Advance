'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';
import { useSearchStore } from '@/stores/searchStore';
import RecentSearches from '@/components/dashboard/RecentSearches';
import NewSearchForm from '@/components/search/NewSearchForm';
import { useUIStore } from '@/stores/uiStore';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchesPage() {
  const { isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();
  const { searches, fetchSearches } = useSearchStore();
  const { openNewSearch } = useUIStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else {
      fetchSearches();
    }
  }, [isAuthenticated, router, fetchSearches]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">All Searches</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openNewSearch}
            className="bg-gradient-to-r from-[var(--color-dark)] to-[var(--color-mid)] text-[var(--color-darkest)] px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} /> New Search
          </motion.button>
        </div>

        <RecentSearches searches={searches} />
      </main>

      <NewSearchForm />
    </div>
  );
}
