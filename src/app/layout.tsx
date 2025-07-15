'use client';

import { Inter } from 'next/font/google';
import { ReactQueryProvider } from '@/lib/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <html lang="ko">
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
