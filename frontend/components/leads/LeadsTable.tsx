'use client';

import { useLeadsStore } from '@/stores/leadsStore';
import { useUIStore } from '@/stores/uiStore';
import { Star, Globe, MapPin, Building2, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeadsTable() {
  const { leads, isLoading, updateLead, fetchLeads, filters, total } = useLeadsStore();
  const { openLeadDetail } = useUIStore();

  const handleSort = (field: string) => {
    let newDir = 'desc';
    if (filters.sort_by === field && filters.sort_dir === 'desc') {
      newDir = 'asc';
    }
    fetchLeads({ sort_by: field, sort_dir: newDir, page: 1 });
  };

  const renderSortIcon = (field: string) => {
    if (filters.sort_by !== field) return null;
    return <span className="ml-1 text-[var(--color-mid)]">{filters.sort_dir === 'asc' ? '↑' : '↓'}</span>;
  };

  const handlePageChange = (newPage: number) => {
    fetchLeads({ page: newPage });
  };

  const totalPages = Math.ceil(total / (filters.per_page || 25));

  if (isLoading && leads.length === 0) {
    return (
      <div className="glassmorphism p-12 flex justify-center items-center">
        <Loader2 className="animate-spin text-[var(--color-mid)]" size={32} />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="glassmorphism p-12 text-center">
        <Building2 className="mx-auto text-[var(--color-light)]/50 mb-4" size={48} />
        <h3 className="text-xl font-medium text-white mb-2">No leads found</h3>
        <p className="text-[var(--color-light)]">Try adjusting your filters or start a new search.</p>
      </div>
    );
  }

  return (
    <div className="glassmorphism bg-black/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/20 text-[var(--color-light)] text-sm">
              <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                Business Name {renderSortIcon('name')}
              </th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('rating')}>
                Rating {renderSortIcon('rating')}
              </th>
              <th className="p-4 font-medium">Website</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium w-16 text-center">Fav</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead, i) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => openLeadDetail(lead)}
                className="hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <td className="p-4 font-medium text-white max-w-[200px] truncate">
                  {lead.business_name}
                </td>
                <td className="p-4 text-sm text-[var(--color-light)] max-w-[150px] truncate">
                  {lead.category || '-'}
                </td>
                <td className="p-4 text-sm text-[var(--color-light)] max-w-[150px] truncate">
                  <div className="flex items-center gap-1">
                    {lead.phone && <Phone size={12} className="text-[var(--color-mid)]" />}
                    <span className="truncate">{lead.phone || '-'}</span>
                  </div>
                </td>
                <td className="p-4">
                  {lead.rating ? (
                    <div className="flex items-center gap-1 text-sm text-white">
                      <Star size={14} className="text-yellow-400" fill="currentColor" />
                      {lead.rating} <span className="text-[var(--color-light)] text-xs">({lead.total_reviews})</span>
                    </div>
                  ) : (
                    <span className="text-[var(--color-light)]">-</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-3">
                    {lead.website_url ? (
                      <a href={lead.website_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-[var(--color-light)] hover:text-[var(--color-mid)] transition-colors">
                        <Globe size={18} />
                      </a>
                    ) : (
                      <Globe size={18} className="text-[var(--color-light)]/30" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium border
                    ${lead.user_status === 'new' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                    ${lead.user_status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                    ${lead.user_status === 'qualified' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                    ${lead.user_status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                  `}>
                    {lead.user_status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLead(lead.id, { is_favorite: !lead.is_favorite });
                    }}
                    className={`p-1 rounded hover:bg-white/10 transition-colors ${lead.is_favorite ? 'text-yellow-400' : 'text-[var(--color-light)] opacity-0 group-hover:opacity-100'}`}
                  >
                    <Star size={18} fill={lead.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/10">
          <span className="text-sm text-[var(--color-light)]">
            Showing {(filters.page - 1) * filters.per_page + 1} to {Math.min(filters.page * filters.per_page, total)} of {total} leads
          </span>
          <div className="flex gap-2">
            <button
              disabled={filters.page === 1}
              onClick={() => handlePageChange(filters.page - 1)}
              className="px-3 py-1 rounded bg-black/30 border border-white/10 text-white disabled:opacity-50 hover:bg-black/50 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={filters.page === totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
              className="px-3 py-1 rounded bg-black/30 border border-white/10 text-white disabled:opacity-50 hover:bg-black/50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
