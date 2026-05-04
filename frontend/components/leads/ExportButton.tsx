'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useLeadsStore } from '@/stores/leadsStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  searchId?: string;
}

export default function ExportButton({ searchId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { filters } = useLeadsStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (searchId) params.append('search_id', searchId);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'page' && key !== 'per_page' && value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/leads/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = response.headers['content-disposition']?.split('filename=')[1] || 'leads_export.csv';
      link.setAttribute('download', filename.replace(/"/g, ''));
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success('Export successful');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 bg-[var(--color-mid)]/20 text-[var(--color-lightest)] px-4 py-2 rounded-lg hover:bg-[var(--color-mid)]/30 transition-colors border border-[var(--color-mid)]/50"
    >
      {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      <span>Export CSV</span>
    </button>
  );
}
