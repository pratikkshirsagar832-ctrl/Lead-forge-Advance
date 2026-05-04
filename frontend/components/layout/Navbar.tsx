'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { logout } = useAuthStore();

  return (
    <nav className="glassmorphism border-b border-white/10 px-6 py-4 sticky top-0 z-40 mb-8 rounded-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-lightest)] to-[var(--color-mid)]">
            LeadForge Advance
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-[var(--color-light)] hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/searches" className="text-[var(--color-light)] hover:text-white transition-colors">
              Searches
            </Link>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="flex items-center gap-2 text-[var(--color-light)] hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </motion.button>
      </div>
    </nav>
  );
}
