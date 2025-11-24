import { Order, User, supabaseApi } from '@/lib/supabase';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Query Keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: { search?: string }) =>
    [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  orders: (userId: string) => [...usersKeys.all, 'orders', userId] as const,
};

/**
 * 사용자 목록 조회 hook
 */
export function useUsers(
  search?: string,
  options?: Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: usersKeys.list({ search }),
    queryFn: () => supabaseApi.getUsers(search),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 특정 사용자의 주문 목록 조회 hook
 */
export function useUserOrders(
  userId: string,
  options?: Omit<UseQueryOptions<Order[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: usersKeys.orders(userId),
    queryFn: () => supabaseApi.getUserOrders(userId),
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
    ...options,
  });
}
