'use client';

import { Sidebar } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = memo<AdminLayoutProps>(function AdminLayout({
  children,
}) {
  // 개별 선택자로 변경하여 불필요한 리렌더링 방지
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();

  // RootLayout에서 이미 초기화하므로 여기서는 제거
  // useEffect(() => {
  //   initialize();
  // }, [initialize]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
});
