'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentSearches from '@/components/dashboard/RecentSearches';
import NewSearchForm from '@/components/search/NewSearchForm';
import { useUIStore } from '@/stores/uiStore';
import { Search, Users, Star, Calendar, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();
  const { openNewSearch } = useUIStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else {
      fetchStats();
    }
  }, [isAuthenticated, router]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated || !stats) return null;

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Searches" value={stats.total_searches} icon={Search} delay={0.1} />
          <StatsCard title="Total Leads" value={stats.total_leads} icon={Users} delay={0.2} />
          <StatsCard title="Favorites" value={stats.total_favorites} icon={Star} delay={0.3} />
          <StatsCard title="Leads This Week" value={stats.leads_this_week} icon={Calendar} delay={0.4} />
        </div>

        <div className="max-w-4xl">
          <RecentSearches searches={stats.recent_searches} />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openNewSearch}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[var(--color-dark)] to-[var(--color-mid)] rounded-full shadow-[0_0_20px_rgba(203,173,141,0.4)] flex items-center justify-center text-[var(--color-darkest)] z-40"
        >
          <Plus size={28} />
        </motion.button>
      </main>

      <NewSearchForm />
    </div>
  );
}
