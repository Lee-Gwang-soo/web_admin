import { supabaseApi } from '@/lib/supabase';
import { create } from 'zustand';

export interface KPIData {
  todayRevenue: number;
  todayOrders: number;
  refunds: number;
  returns: number;
  revenueChange: number;
  ordersChange: number;
  refundsChange: number;
  returnsChange: number;
}

export interface ChartData {
  hourlyRevenue: Array<{ hour: string; revenue: number }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  categoryRevenue: Array<{ category: string; revenue: number }>;
  categorySales: Array<{ category: string; count: number }>;
}

export interface DashboardState {
  kpiData: KPIData;
  chartData: ChartData;
  loading: boolean;
  isRefreshing: boolean; // 자동 새로고침 상태 (skeleton UI 표시 안함)
  error: string | null;
  lastUpdated: Date | null;
  dateFilter: 'today' | 'yesterday' | 'week';
  fetchDashboardData: (isAutoRefresh?: boolean) => Promise<void>;
  setDateFilter: (filter: 'today' | 'yesterday' | 'week') => void;
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => {
  let updateInterval: NodeJS.Timeout | null = null;

  return {
    kpiData: {
      todayRevenue: 0,
      todayOrders: 0,
      refunds: 0,
      returns: 0,
      revenueChange: 0,
      ordersChange: 0,
      refundsChange: 0,
      returnsChange: 0,
    },
    chartData: {
      hourlyRevenue: [],
      orderStatusDistribution: [],
      categoryRevenue: [],
      categorySales: [],
    },
    loading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    dateFilter: 'today',

    fetchDashboardData: async (isAutoRefresh = false) => {
      try {
        // 자동 새로고침일 경우 isRefreshing만 true로, 수동 새로고침일 경우 loading을 true로
        if (isAutoRefresh) {
          set({ isRefreshing: true, error: null });
        } else {
          set({ loading: true, error: null });
        }

        const dateFilter = get().dateFilter;

        // Fetch all data in parallel
        const [
          kpiData,
          hourlyRevenue,
          orderStatusDistribution,
          categoryRevenue,
          categorySales,
        ] = await Promise.all([
          supabaseApi.getDashboardKPI(dateFilter),
          supabaseApi.getHourlyRevenue(dateFilter),
          supabaseApi.getOrderStatusDistribution(dateFilter),
          supabaseApi.getCategoryRevenue(dateFilter),
          supabaseApi.getCategorySales(dateFilter),
        ]);

        set({
          kpiData,
          chartData: {
            hourlyRevenue,
            orderStatusDistribution,
            categoryRevenue,
            categorySales,
          },
          lastUpdated: new Date(),
          loading: false,
          isRefreshing: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);

        // Fallback to mock data if there's an error
        const mockData = generateMockData(get().dateFilter);

        set({
          kpiData: mockData.kpiData,
          chartData: mockData.chartData,
          lastUpdated: new Date(),
          loading: false,
          isRefreshing: false,
          error:
            error instanceof Error ? error.message : 'Failed to fetch data',
        });
      }
    },

    setDateFilter: (filter) => {
      set({ dateFilter: filter });
      get().fetchDashboardData();
    },

    startRealTimeUpdates: () => {
      const { stopRealTimeUpdates, fetchDashboardData } = get();

      // Stop existing interval
      stopRealTimeUpdates();

      // Start new interval for 60-second updates (1분마다 자동 새로고침)
      updateInterval = setInterval(() => {
        fetchDashboardData(true); // 자동 새로고침 플래그 전달
      }, 60000);
    },

    stopRealTimeUpdates: () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    },
  };
});

// Fallback mock data function (keep for error cases)
const generateMockData = (
  filter: 'today' | 'yesterday' | 'week'
): { kpiData: KPIData; chartData: ChartData } => {
  const multiplier = filter === 'week' ? 7 : 1;
  const baseRevenue = filter === 'yesterday' ? 12000 : 15000;

  return {
    kpiData: {
      todayRevenue: baseRevenue * multiplier,
      todayOrders: (156 + Math.floor(Math.random() * 50)) * multiplier,
      refunds: Math.floor(Math.random() * 10) * multiplier,
      returns: Math.floor(Math.random() * 8) * multiplier,
      revenueChange: (Math.random() - 0.5) * 20,
      ordersChange: (Math.random() - 0.5) * 20,
      refundsChange: (Math.random() - 0.5) * 30,
      returnsChange: (Math.random() - 0.5) * 30,
    },
    chartData: {
      hourlyRevenue: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        revenue: Math.floor(Math.random() * 2000) + 500,
      })),
      orderStatusDistribution: [
        { status: 'Pending', count: 45, color: '#f59e0b' },
        { status: 'Processing', count: 32, color: '#3b82f6' },
        { status: 'Shipped', count: 67, color: '#10b981' },
        { status: 'Delivered', count: 234, color: '#8b5cf6' },
        { status: 'Cancelled', count: 12, color: '#ef4444' },
      ],
      categoryRevenue: [
        { category: 'Electronics', revenue: 45000 },
        { category: 'Clothing', revenue: 32000 },
        { category: 'Books', revenue: 18000 },
        { category: 'Home & Garden', revenue: 25000 },
        { category: 'Sports', revenue: 15000 },
      ],
      categorySales: [
        { category: 'Electronics', count: 120 },
        { category: 'Clothing', count: 95 },
        { category: 'Books', count: 78 },
        { category: 'Home & Garden', count: 65 },
        { category: 'Sports', count: 52 },
      ],
    },
  };
};
