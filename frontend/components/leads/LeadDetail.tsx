'use client';

import { useUIStore } from '@/stores/uiStore';
import { useLeadsStore } from '@/stores/leadsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MapPin, Phone, Globe, MessageSquare, Building2, Check, Copy, ExternalLink } from 'lucide-react';
import { LeadStatus } from '@/types/lead';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function LeadDetail() {
  const { isLeadDetailOpen, selectedLead, closeLeadDetail } = useUIStore();
  const { updateLead } = useLeadsStore();
  const [notes, setNotes] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (selectedLead) {
      setNotes(selectedLead.user_notes || '');
    }
  }, [selectedLead]);

  if (!selectedLead) return null;

  const handleNotesBlur = () => {
    if (notes !== selectedLead.user_notes) {
      updateLead(selectedLead.id, { user_notes: notes });
    }
  };

  const handleFavorite = () => {
    updateLead(selectedLead.id, { is_favorite: !selectedLead.is_favorite });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateLead(selectedLead.id, { user_status: e.target.value as LeadStatus });
  };

  const copyPhone = () => {
    if (selectedLead.phone) {
      navigator.clipboard.writeText(selectedLead.phone);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success('Phone copied to clipboard');
    }
  };

  return (
    <AnimatePresence>
      {isLeadDetailOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeLeadDetail}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-darkest)] border-l border-white/10 z-50 shadow-2xl overflow-y-auto flex flex-col"
          >
            <div className="p-6 border-b border-white/10 sticky top-0 bg-[var(--color-darkest)]/90 backdrop-blur-md z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white truncate pr-4">{selectedLead.business_name}</h2>
              <div className="flex gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleFavorite}
                  className={`p-2 rounded-lg transition-colors ${selectedLead.is_favorite ? 'text-yellow-400 bg-yellow-400/20' : 'text-[var(--color-light)] hover:text-white hover:bg-white/10'}`}
                >
                  <Star fill={selectedLead.is_favorite ? 'currentColor' : 'none'} size={20} />
                </motion.button>
                <button
                  onClick={closeLeadDetail}
                  className="p-2 text-[var(--color-light)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-light)] mb-2">Status</label>
                <select
                  value={selectedLead.user_status}
                  onChange={handleStatusChange}
                  className="w-full bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mid)] [&>option]:bg-[#3A2D28] [&>option]:text-white"
                >
                  {Object.values(LeadStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Info grid */}
              <div className="space-y-4">
                {selectedLead.category && (
                  <div className="flex items-start gap-3 text-[var(--color-light)]">
                    <Building2 className="shrink-0 mt-0.5 text-[var(--color-mid)]" size={18} />
                    <span className="bg-[var(--color-mid)]/20 text-[var(--color-lightest)] px-2 py-0.5 rounded text-sm border border-[var(--color-mid)]/30">
                      {selectedLead.category}
                    </span>
                  </div>
                )}
                
                {selectedLead.phone && (
                  <div className="flex items-center gap-3 text-[var(--color-light)]">
                    <Phone className="shrink-0 text-[var(--color-mid)]" size={18} />
                    <a href={`tel:${selectedLead.phone}`} className="hover:text-white transition-colors">{selectedLead.phone}</a>
                    <button onClick={copyPhone} className="p-1 hover:bg-white/10 rounded ml-auto text-[var(--color-mid)]">
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                {selectedLead.website_url && (
                  <div className="flex items-center gap-3 text-[var(--color-light)]">
                    <Globe className="shrink-0 text-[var(--color-mid)]" size={18} />
                    <a href={selectedLead.website_url} target="_blank" rel="noreferrer" className="truncate hover:text-white transition-colors">
                      {selectedLead.website_url}
                    </a>
                    <a href={selectedLead.website_url} target="_blank" rel="noreferrer" className="p-1 hover:bg-white/10 rounded ml-auto text-[var(--color-mid)]">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {selectedLead.full_address && (
                  <div className="flex items-start gap-3 text-[var(--color-light)]">
                    <MapPin className="shrink-0 mt-0.5 text-[var(--color-mid)]" size={18} />
                    <span className="text-sm leading-relaxed">{selectedLead.full_address}</span>
                  </div>
                )}

                {selectedLead.rating && (
                  <div className="flex items-center gap-3 text-[var(--color-light)]">
                    <Star className="shrink-0 text-yellow-400" fill="currentColor" size={18} />
                    <span>
                      <span className="font-bold text-white">{selectedLead.rating}</span>
                      <span className="text-sm ml-1">({selectedLead.total_reviews} reviews)</span>
                    </span>
                  </div>
                )}


              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-light)] mb-2">
                  <MessageSquare size={16} /> Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Add notes..."
                  className="w-full h-32 bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mid)] resize-none"
                />
                <div className="text-right text-xs text-[var(--color-light)] mt-1">
                  {notes.length} characters
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
