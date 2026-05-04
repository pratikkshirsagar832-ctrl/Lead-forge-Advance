'use client';

import { Search } from '@/types/search';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface RecentSearchesProps {
  searches: Search[];
}

export default function RecentSearches({ searches }: RecentSearchesProps) {
  if (!searches || searches.length === 0) {
    return (
      <div className="glassmorphism p-6 text-center text-[var(--color-light)]">
        No recent searches found.
      </div>
    );
  }

  return (
    <div className="glassmorphism bg-black/60 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Recent Searches</h2>
      </div>
      <div className="divide-y divide-white/10">
        {searches.map((search, i) => (
          <motion.div
            key={search.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/searches/${search.id}`}
              className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
            >
              <div>
                <h3 className="font-semibold text-white group-hover:text-[var(--color-mid)] transition-colors">
                  {search.niche} in {search.location}
                </h3>
                <p className="text-sm text-[var(--color-light)] mt-1">
                  {format(new Date(search.created_at), 'MMM d, yyyy HH:mm')} • {search.leads_collected} leads
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-black/30 border border-white/10
                  ${search.status === 'completed' ? 'text-green-400 border-green-400/30' : ''}
                  ${search.status === 'running' ? 'text-blue-400 border-blue-400/30' : ''}
                  ${search.status === 'failed' ? 'text-red-400 border-red-400/30' : ''}
                `}>
                  {search.status}
                </span>
                <ChevronRight className="text-[var(--color-light)] group-hover:text-[var(--color-mid)] transition-colors" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
