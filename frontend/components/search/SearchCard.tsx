'use client';

import { Search } from '@/types/search';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function SearchCard({ search }: { search: Search }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">
          {search.niche} in {search.location}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-light)]">
          <span>{format(new Date(search.created_at), 'MMM d, yyyy HH:mm')}</span>
          <span>•</span>
          <span className="font-semibold text-[var(--color-mid)]">{search.leads_collected} leads found</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-4 py-2 rounded-lg text-sm font-medium bg-black/30 border border-white/10
          ${search.status === 'completed' ? 'text-green-400 border-green-400/30' : ''}
          ${search.status === 'failed' ? 'text-red-400 border-red-400/30' : ''}
          ${search.status === 'partial' ? 'text-orange-400 border-orange-400/30' : ''}
          ${search.status === 'cancelled' ? 'text-gray-400 border-gray-400/30' : ''}
        `}>
          {search.status.toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
}
