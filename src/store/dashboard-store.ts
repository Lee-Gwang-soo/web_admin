import { create } from 'zustand';
import { supabaseApi } from '@/lib/supabase';

export interface KPIData {
  todayRevenue: number;
  todayOrders: number;
  activeUsers: number;
  conversionRate: number;
}

export interface ChartData {
  hourlyRevenue: Array<{ hour: string; revenue: number }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  categoryRevenue: Array<{ category: string; revenue: number }>;
}

export interface DashboardState {
  kpiData: KPIData;
  chartData: ChartData;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  dateFilter: 'today' | 'yesterday' | 'week';
  fetchDashboardData: () => Promise<void>;
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
      activeUsers: 0,
      conversionRate: 0,
    },
    chartData: {
      hourlyRevenue: [],
      orderStatusDistribution: [],
      categoryRevenue: [],
    },
    loading: false,
    error: null,
    lastUpdated: null,
    dateFilter: 'today',

    fetchDashboardData: async () => {
      try {
        set({ loading: true, error: null });

        const dateFilter = get().dateFilter;

        // Fetch all data in parallel
        const [
          kpiData,
          hourlyRevenue,
          orderStatusDistribution,
          categoryRevenue,
        ] = await Promise.all([
          supabaseApi.getDashboardKPI(dateFilter),
          supabaseApi.getHourlyRevenue(dateFilter),
          supabaseApi.getOrderStatusDistribution(),
          supabaseApi.getCategoryRevenue(),
        ]);

        set({
          kpiData,
          chartData: {
            hourlyRevenue,
            orderStatusDistribution,
            categoryRevenue,
          },
          lastUpdated: new Date(),
          loading: false,
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

      // Start new interval for 10-second updates (reduced frequency for real data)
      updateInterval = setInterval(() => {
        fetchDashboardData();
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
      activeUsers: 1420 + Math.floor(Math.random() * 200),
      conversionRate: 3.2 + Math.random() * 1.5,
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
    },
  };
};
