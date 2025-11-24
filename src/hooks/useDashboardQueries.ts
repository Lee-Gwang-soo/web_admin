import { supabaseApi } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

// Query Keys - 캐시 키 관리를 위한 상수
export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpi: (dateFilter: 'today' | 'yesterday' | 'week') =>
    [...dashboardKeys.all, 'kpi', dateFilter] as const,
  hourlyRevenue: (dateFilter: 'today' | 'yesterday' | 'week') =>
    [...dashboardKeys.all, 'hourlyRevenue', dateFilter] as const,
  orderStatusDistribution: (dateFilter: 'today' | 'yesterday' | 'week') =>
    [...dashboardKeys.all, 'orderStatusDistribution', dateFilter] as const,
  categoryRevenue: (dateFilter: 'today' | 'yesterday' | 'week') =>
    [...dashboardKeys.all, 'categoryRevenue', dateFilter] as const,
  categorySales: (dateFilter: 'today' | 'yesterday' | 'week') =>
    [...dashboardKeys.all, 'categorySales', dateFilter] as const,
};

/**
 * 대시보드 KPI 데이터 조회 hook
 * - 자동 캐싱 및 백그라운드 refetch
 * - staleTime: 1분 (기본값)
 */
export function useDashboardKPI(
  dateFilter: 'today' | 'yesterday' | 'week' = 'today'
) {
  return useQuery({
    queryKey: dashboardKeys.kpi(dateFilter),
    queryFn: () => supabaseApi.getDashboardKPI(dateFilter),
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 시간별 매출 데이터 조회 hook
 */
export function useHourlyRevenue(
  dateFilter: 'today' | 'yesterday' | 'week' = 'today'
) {
  return useQuery({
    queryKey: dashboardKeys.hourlyRevenue(dateFilter),
    queryFn: () => supabaseApi.getHourlyRevenue(dateFilter),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * 주문 상태 분포 데이터 조회 hook
 */
export function useOrderStatusDistribution(
  dateFilter: 'today' | 'yesterday' | 'week' = 'today'
) {
  return useQuery({
    queryKey: dashboardKeys.orderStatusDistribution(dateFilter),
    queryFn: () => supabaseApi.getOrderStatusDistribution(dateFilter),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * 카테고리별 매출 데이터 조회 hook
 */
export function useCategoryRevenue(
  dateFilter: 'today' | 'yesterday' | 'week' = 'today'
) {
  return useQuery({
    queryKey: dashboardKeys.categoryRevenue(dateFilter),
    queryFn: () => supabaseApi.getCategoryRevenue(dateFilter),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * 카테고리별 판매건수 데이터 조회 hook
 */
export function useCategorySales(
  dateFilter: 'today' | 'yesterday' | 'week' = 'today'
) {
  return useQuery({
    queryKey: dashboardKeys.categorySales(dateFilter),
    queryFn: () => supabaseApi.getCategorySales(dateFilter),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * 모든 대시보드 데이터를 한번에 조회하는 hook
 * - 여러 query를 병렬로 실행
 * - 하나라도 로딩중이면 isLoading: true
 */
export function useDashboardData(
  dateFilter: 'today' | 'yesterday' | 'week' = 'today'
) {
  const kpi = useDashboardKPI(dateFilter);
  const hourlyRevenue = useHourlyRevenue(dateFilter);
  const orderStatusDistribution = useOrderStatusDistribution(dateFilter);
  const categoryRevenue = useCategoryRevenue(dateFilter);
  const categorySales = useCategorySales(dateFilter);

  return {
    kpi: kpi.data,
    hourlyRevenue: hourlyRevenue.data,
    orderStatusDistribution: orderStatusDistribution.data,
    categoryRevenue: categoryRevenue.data,
    categorySales: categorySales.data,
    isLoading:
      kpi.isLoading ||
      hourlyRevenue.isLoading ||
      orderStatusDistribution.isLoading ||
      categoryRevenue.isLoading ||
      categorySales.isLoading,
    isError:
      kpi.isError ||
      hourlyRevenue.isError ||
      orderStatusDistribution.isError ||
      categoryRevenue.isError ||
      categorySales.isError,
    error:
      kpi.error ||
      hourlyRevenue.error ||
      orderStatusDistribution.error ||
      categoryRevenue.error ||
      categorySales.error,
    refetch: () => {
      kpi.refetch();
      hourlyRevenue.refetch();
      orderStatusDistribution.refetch();
      categoryRevenue.refetch();
      categorySales.refetch();
    },
  };
}
