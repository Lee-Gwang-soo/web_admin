'use client';

import { ReactQueryProvider } from '@/lib/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useI18nStore } from '@/store/i18n-store';
import { useThemeStore } from '@/store/theme-store';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize: initializeAuth } = useAuthStore();
  const { initialize: initializeTheme } = useThemeStore();
  const { initialize: initializeI18n } = useI18nStore();

  useEffect(() => {
    // 시스템 초기화 순서: 테마 → 다국어 → 인증
    initializeTheme();
    initializeI18n();
    initializeAuth();
  }, [initializeTheme, initializeI18n, initializeAuth]);

  return (
    <html lang="ko">
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
