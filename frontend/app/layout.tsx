import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Background from '@/components/layout/Background';
import ParticleField from '@/components/layout/ParticleField';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeadForge Advance',
  description: 'Internal lead generation tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-slate-100 min-h-screen`}>
        <Background />
        <ParticleField />
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#3A2D28',
              color: '#fff',
              border: '1px solid rgba(203, 173, 141, 0.2)',
            }
          }}
        />
      </body>
    </html>
  );
}
