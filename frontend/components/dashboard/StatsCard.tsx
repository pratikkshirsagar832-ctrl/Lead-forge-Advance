'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  delay?: number;
}

export default function StatsCard({ title, value, icon: Icon, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glassmorphism bg-black/60 p-6 flex items-center gap-4"
    >
      <div className="p-4 bg-[var(--color-mid)]/20 rounded-xl text-[var(--color-mid)]">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[var(--color-light)] text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
    </motion.div>
  );
}
