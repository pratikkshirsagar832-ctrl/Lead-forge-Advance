'use client';

import { useLeadsStore } from '@/stores/leadsStore';
import { LeadStatus } from '@/types/lead';
import { Search, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FilterBar() {
  const { filters, fetchLeads, resetFilters } = useLeadsStore();
  const [searchTerm, setSearchTerm] = useState(filters.name || '');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== filters.name) {
        fetchLeads({ name: searchTerm, page: 1 });
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="glassmorphism p-4 mb-6 flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-light)]" size={18} />
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/20 border border-[var(--color-mid)]/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[var(--color-mid)]"
        />
      </div>

      <select
        value={filters.status || 'All'}
        onChange={(e) => fetchLeads({ status: e.target.value, page: 1 })}
        className="bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-2 text-white focus:outline-none [&>option]:bg-[#3A2D28] [&>option]:text-white"
      >
        <option value="All">All Statuses</option>
        {Object.values(LeadStatus).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.is_favorite !== undefined ? String(filters.is_favorite) : 'All'}
        onChange={(e) => {
          const val = e.target.value;
          fetchLeads({ is_favorite: val === 'All' ? undefined : val === 'true', page: 1 });
        }}
        className="bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-2 text-white focus:outline-none [&>option]:bg-[#3A2D28] [&>option]:text-white"
      >
        <option value="All">All Favorites</option>
        <option value="true">Favorites Only</option>
        <option value="false">Not Favorites</option>
      </select>

      <select
        value={filters.has_website !== undefined ? String(filters.has_website) : 'All'}
        onChange={(e) => {
          const val = e.target.value;
          fetchLeads({ has_website: val === 'All' ? undefined : val === 'true', page: 1 });
        }}
        className="bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-2 text-white focus:outline-none [&>option]:bg-[#3A2D28] [&>option]:text-white"
      >
        <option value="All">All Websites</option>
        <option value="true">Has Website</option>
        <option value="false">No Website</option>
      </select>
      
      <select
        value={`${filters.sort_by}-${filters.sort_dir}`}
        onChange={(e) => {
          const [sort_by, sort_dir] = e.target.value.split('-');
          fetchLeads({ sort_by, sort_dir, page: 1 });
        }}
        className="bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-2 text-white focus:outline-none [&>option]:bg-[#3A2D28] [&>option]:text-white"
      >
        <option value="date-desc">Newest First</option>
        <option value="date-asc">Oldest First</option>
        <option value="rating-desc">Highest Rating</option>
        <option value="reviews-desc">Most Reviews</option>
        <option value="name-asc">Name A-Z</option>
      </select>

      <button
        onClick={() => {
          setSearchTerm('');
          resetFilters();
        }}
        className="p-2 rounded-lg bg-black/20 text-[var(--color-light)] hover:text-white border border-[var(--color-mid)]/30 transition-colors"
        title="Reset Filters"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
}
