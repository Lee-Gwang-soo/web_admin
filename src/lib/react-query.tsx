'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분 - 데이터가 fresh한 상태로 유지되는 시간
            gcTime: 5 * 60 * 1000, // 5분 - 캐시 데이터 유지 시간 (구 cacheTime)
            refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
            refetchOnReconnect: true, // 네트워크 재연결 시 refetch
            retry: (failureCount, error) => {
              // 404, 401, 403 에러는 재시도하지 않음
              if (
                error instanceof Error &&
                (error.message.includes('404') ||
                  error.message.includes('401') ||
                  error.message.includes('403'))
              ) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
          },
          mutations: {
            retry: false, // mutation은 자동 재시도 하지 않음
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
