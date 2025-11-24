import { OrderWithItems, supabaseApi } from '@/lib/supabase';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

// Query Keys
export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (filters: { search?: string; status?: string }) =>
    [...ordersKeys.lists(), filters] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
  statuses: () => [...ordersKeys.all, 'statuses'] as const,
  userOrders: (userId: string) => [...ordersKeys.all, 'user', userId] as const,
};

/**
 * 주문 목록 조회 hook
 */
export function useOrders(
  search?: string,
  status?: string,
  options?: Omit<
    UseQueryOptions<OrderWithItems[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ordersKeys.list({ search, status }),
    queryFn: () => supabaseApi.getOrders(search, status),
    staleTime: 30 * 1000, // 30초 - 주문 데이터는 자주 변경됨
    gcTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * 주문 상태 목록 조회 hook
 */
export function useOrderStatuses(
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ordersKeys.statuses(),
    queryFn: () => supabaseApi.getOrderStatuses(),
    staleTime: 10 * 60 * 1000, // 10분 - 상태 목록은 거의 변하지 않음
    gcTime: 30 * 60 * 1000, // 30분
    ...options,
  });
}

/**
 * 특정 사용자의 주문 목록 조회 hook
 */
export function useUserOrders(
  userId: string,
  options?: Omit<
    UseQueryOptions<OrderWithItems[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ordersKeys.userOrders(userId),
    queryFn: () => supabaseApi.getUserOrders(userId),
    staleTime: 60 * 1000, // 1분
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!userId, // userId가 있을 때만 실행
    ...options,
  });
}

/**
 * 주문 상태 업데이트 mutation hook
 * - 낙관적 업데이트 적용
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      supabaseApi.updateOrderStatus(orderId, status),
    onMutate: async ({ orderId, status }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ordersKeys.lists() });

      // 이전 데이터 백업
      const previousOrders = queryClient.getQueriesData({
        queryKey: ordersKeys.lists(),
      });

      // 낙관적 업데이트
      queryClient.setQueriesData<OrderWithItems[]>(
        { queryKey: ordersKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((order) =>
            order.id === orderId ? { ...order, status: status as any } : order
          );
        }
      );

      return { previousOrders };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousOrders) {
        context.previousOrders.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('❌ Error updating order status:', error);
    },
    onSuccess: (data, { orderId, status }) => {
      // 성공 시 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });

      // 대시보드 데이터도 무효화 (주문 상태 변경이 대시보드에 영향)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      console.log('✅ Order status updated:', orderId, status);
    },
  });
}

/**
 * 주문 대량 상태 업데이트 mutation hook
 */
export function useBulkUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderIds,
      status,
    }: {
      orderIds: string[];
      status: string;
    }) => supabaseApi.bulkUpdateOrderStatus(orderIds, status),
    onMutate: async ({ orderIds, status }) => {
      await queryClient.cancelQueries({ queryKey: ordersKeys.lists() });

      const previousOrders = queryClient.getQueriesData({
        queryKey: ordersKeys.lists(),
      });

      // 낙관적 업데이트
      queryClient.setQueriesData<OrderWithItems[]>(
        { queryKey: ordersKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((order) =>
            orderIds.includes(order.id)
              ? { ...order, status: status as any }
              : order
          );
        }
      );

      return { previousOrders };
    },
    onError: (error, variables, context) => {
      if (context?.previousOrders) {
        context.previousOrders.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('❌ Error bulk updating order status:', error);
    },
    onSuccess: (data, { orderIds, status }) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      console.log('✅ Bulk order status updated:', orderIds.length, status);
    },
  });
}

/**
 * 주문 삭제 mutation hook
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => supabaseApi.deleteOrder(orderId),
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: ordersKeys.lists() });

      const previousOrders = queryClient.getQueriesData({
        queryKey: ordersKeys.lists(),
      });

      // 낙관적 업데이트
      queryClient.setQueriesData<OrderWithItems[]>(
        { queryKey: ordersKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.filter((order) => order.id !== orderId);
        }
      );

      return { previousOrders };
    },
    onError: (error, variables, context) => {
      if (context?.previousOrders) {
        context.previousOrders.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('❌ Error deleting order:', error);
    },
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      console.log('✅ Order deleted successfully:', orderId);
    },
  });
}

/**
 * 주문 대량 삭제 mutation hook
 */
export function useBulkDeleteOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderIds: string[]) => supabaseApi.bulkDeleteOrders(orderIds),
    onMutate: async (orderIds) => {
      await queryClient.cancelQueries({ queryKey: ordersKeys.lists() });

      const previousOrders = queryClient.getQueriesData({
        queryKey: ordersKeys.lists(),
      });

      // 낙관적 업데이트
      queryClient.setQueriesData<OrderWithItems[]>(
        { queryKey: ordersKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.filter((order) => !orderIds.includes(order.id));
        }
      );

      return { previousOrders };
    },
    onError: (error, variables, context) => {
      if (context?.previousOrders) {
        context.previousOrders.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('❌ Error bulk deleting orders:', error);
    },
    onSuccess: (data, orderIds) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      console.log('✅ Bulk delete completed:', orderIds.length, 'orders');
    },
  });
}
