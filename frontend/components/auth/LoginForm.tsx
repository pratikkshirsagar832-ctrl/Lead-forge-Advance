'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

const loginSchema = z.object({
  user_id: z.string().min(1, 'ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/login', data);
      login(res.data.access_token);
      toast.success('Login successful!');
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glassmorphism p-8 w-full max-w-md rounded-2xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-lightest)] to-[var(--color-mid)] mb-2">
          LeadForge Advance
        </h1>
        <p className="text-[var(--color-light)]">Enter your credentials to access</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-light)] mb-1">User ID</label>
          <input
            {...register('user_id')}
            className="w-full bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mid)] transition-all"
            placeholder="Enter User ID"
          />
          {errors.user_id && <p className="text-red-400 text-sm mt-1">{errors.user_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-light)] mb-1">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-black/20 border border-[var(--color-mid)]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mid)] transition-all"
              placeholder="Enter Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-[var(--color-light)] hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[var(--color-dark)] to-[var(--color-mid)] text-[var(--color-darkest)] font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : null}
          {isLoading ? 'Signing In...' : 'Sign In'}
        </motion.button>
      </form>
    </motion.div>
  );
}
