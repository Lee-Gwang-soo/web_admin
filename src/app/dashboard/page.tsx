'use client';

import { ChartsSection } from '@/components/organisms/dashboard/ChartsSection';
import { DashboardControls } from '@/components/organisms/dashboard/DashboardControls';
import { KPISection } from '@/components/organisms/dashboard/KPISection';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate';
import { useDashboardData } from '@/hooks/useDashboardQueries';
import { useDashboardStore } from '@/store/dashboard-store';
import { useI18nStore } from '@/store/i18n-store';
import { useCallback, useEffect, useMemo } from 'react';

export default function DashboardPage() {
  const { t, locale, isLoading: i18nLoading } = useI18nStore();

  // UI 상태 (Zustand)
  const dateFilter = useDashboardStore((state) => state.dateFilter);
  const setDateFilter = useDashboardStore((state) => state.setDateFilter);
  const startRealTimeUpdates = useDashboardStore(
    (state) => state.startRealTimeUpdates
  );
  const stopRealTimeUpdates = useDashboardStore(
    (state) => state.stopRealTimeUpdates
  );

  // 서버 데이터 (React Query)
  const {
    kpi,
    hourlyRevenue,
    orderStatusDistribution,
    categoryRevenue,
    categorySales,
    isLoading,
    refetch,
  } = useDashboardData(dateFilter);

  // 페이지 타이틀 설정
  useEffect(() => {
    if (!i18nLoading) {
      document.title = `${t('dashboard.title')} - Admin Dashboard`;
    }
  }, [t, locale, i18nLoading]);

  // 실시간 업데이트 초기화
  useEffect(() => {
    startRealTimeUpdates(() => {
      refetch();
    });

    return () => {
      stopRealTimeUpdates();
    };
  }, [startRealTimeUpdates, stopRealTimeUpdates, refetch]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle date filter change
  const handleDateFilterChange = useCallback(
    (value: 'today' | 'yesterday' | 'week') => {
      setDateFilter(value);
    },
    [setDateFilter]
  );

  // Handle Excel export (placeholder)
  const handleExportData = useCallback(async () => {
    try {
      console.log('Export functionality to be implemented');
      // TODO: Implement excel export
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);

  // 차트 데이터 구성
  const chartData = useMemo(
    () => ({
      hourlyRevenue: hourlyRevenue || [],
      orderStatusDistribution: orderStatusDistribution || [],
      categoryRevenue: categoryRevenue || [],
      categorySales: categorySales || [],
    }),
    [hourlyRevenue, orderStatusDistribution, categoryRevenue, categorySales]
  );

  // KPI 섹션 컴포넌트
  const kpiSection = useMemo(() => {
    return (
      <KPISection
        data={
          kpi || {
            todayRevenue: 0,
            todayOrders: 0,
            refunds: 0,
            returns: 0,
            revenueChange: 0,
            ordersChange: 0,
            refundsChange: 0,
            returnsChange: 0,
          }
        }
        dateFilter={dateFilter}
        loading={isLoading}
      />
    );
  }, [kpi, dateFilter, isLoading, locale]);

  // 컨트롤 섹션 컴포넌트
  const controlsSection = useMemo(() => {
    return (
      <DashboardControls
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
        onRefresh={handleRefresh}
        onExport={handleExportData}
        loading={isLoading}
      />
    );
  }, [
    dateFilter,
    handleDateFilterChange,
    handleRefresh,
    handleExportData,
    isLoading,
    locale,
  ]);

  // 차트 섹션 컴포넌트
  const chartsSection = useMemo(() => {
    return <ChartsSection data={chartData} loading={isLoading} />;
  }, [chartData, isLoading, locale]);

  return (
    <DashboardTemplate
      title={t('dashboard.title')}
      description={t('dashboard.description')}
      kpiSection={kpiSection}
      controlsSection={controlsSection}
      chartsSection={chartsSection}
      loading={isLoading}
    />
  );
}
