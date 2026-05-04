'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';
import SearchProgress from '@/components/search/SearchProgress';
import SearchCard from '@/components/search/SearchCard';
import FilterBar from '@/components/leads/FilterBar';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadDetail from '@/components/leads/LeadDetail';
import ExportButton from '@/components/leads/ExportButton';
import { usePolling } from '@/hooks/usePolling';
import { useLeads } from '@/hooks/useLeads';
import { motion } from 'framer-motion';

export default function SearchDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const searchId = Array.isArray(id) ? id[0] : id;
  const { search, isPolling } = usePolling(searchId);
  const { total } = useLeads(searchId);

  if (!isAuthenticated || !search) return null;

  const isRunning = search.status === 'queued' || search.status === 'running';

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6">
        {isRunning ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-12"
          >
            <SearchProgress search={search} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SearchCard search={search} />
            
            <div className="flex justify-between items-end mb-6">
              <div className="w-full max-w-4xl">
                <FilterBar />
              </div>
              <div className="pb-6">
                <ExportButton searchId={searchId} />
              </div>
            </div>

            <LeadsTable />
          </motion.div>
        )}
      </main>

      <LeadDetail />
    </div>
  );
}
