'use client';

import { ChartsSection } from '@/components/organisms/dashboard/ChartsSection';
import { DashboardControls } from '@/components/organisms/dashboard/DashboardControls';
import { KPISection } from '@/components/organisms/dashboard/KPISection';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate';
import { useDashboardStore } from '@/store/dashboard-store';
import { useI18nStore } from '@/store/i18n-store';
import { useCallback, useEffect, useMemo } from 'react';

export default function DashboardPage() {
  const { t, locale } = useI18nStore();
  const {
    kpiData,
    chartData,
    loading,
    dateFilter,
    fetchDashboardData,
    setDateFilter,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  } = useDashboardStore();

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = `${t('dashboard.title')} - Admin Dashboard`;
  }, [t]);

  // Initialize dashboard data and real-time updates
  useEffect(() => {
    fetchDashboardData();
    startRealTimeUpdates();

    return () => {
      stopRealTimeUpdates();
    };
  }, [fetchDashboardData, startRealTimeUpdates, stopRealTimeUpdates]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  // KPI 섹션 컴포넌트
  const kpiSection = useMemo(() => {
    return (
      <KPISection data={kpiData} dateFilter={dateFilter} loading={loading} />
    );
  }, [kpiData, dateFilter, loading, locale]);

  // 컨트롤 섹션 컴포넌트
  const controlsSection = useMemo(() => {
    return (
      <DashboardControls
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
        onRefresh={handleRefresh}
        onExport={handleExportData}
        loading={loading}
      />
    );
  }, [
    dateFilter,
    handleDateFilterChange,
    handleRefresh,
    handleExportData,
    loading,
    locale,
    t,
  ]);

  // 차트 섹션 컴포넌트
  const chartsSection = useMemo(() => {
    return <ChartsSection data={chartData} loading={loading} />;
  }, [chartData, loading, locale, t]);

  return (
    <DashboardTemplate
      title={t('dashboard.title')}
      description={t('dashboard.description')}
      kpiSection={kpiSection}
      controlsSection={controlsSection}
      chartsSection={chartsSection}
      loading={loading}
    />
  );
}
