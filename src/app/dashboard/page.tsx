'use client';

import { ChartsSection } from '@/components/organisms/dashboard/ChartsSection';
import { DashboardControls } from '@/components/organisms/dashboard/DashboardControls';
import { KPISection } from '@/components/organisms/dashboard/KPISection';
import { SystemInfoSection } from '@/components/organisms/dashboard/SystemInfoSection';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate';
import { Badge } from '@/components/ui/badge';
import { DashboardExportService } from '@/lib/services/dashboard-export.service';
import { useDashboardStore } from '@/store/dashboard-store';
import { useTranslation } from '@/store/i18n-store';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const {
    kpiData,
    chartData,
    loading,
    lastUpdated,
    dateFilter,
    fetchDashboardData,
    setDateFilter,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  } = useDashboardStore();

  // Initialize dashboard data and real-time updates
  useEffect(() => {
    fetchDashboardData();
    startRealTimeUpdates();

    return () => {
      stopRealTimeUpdates();
    };
  }, [fetchDashboardData, startRealTimeUpdates, stopRealTimeUpdates]);

  // Handle Excel export with error handling
  const handleExportData = useCallback(async () => {
    try {
      await DashboardExportService.exportToExcel(kpiData, chartData, t);
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('messages.dataLoadError'));
    }
  }, [kpiData, chartData, t]);

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

  // Format last updated time
  const formatLastUpdated = useCallback((date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }, []);

  // Header actions with real-time status
  const headerActions = useMemo(
    () => (
      <div className="flex items-center space-x-4">
        {lastUpdated && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>
              {t('dashboard.lastUpdated')}: {formatLastUpdated(lastUpdated)}
            </span>
          </div>
        )}
        <Badge
          variant="outline"
          className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          {t('dashboard.realTimeMonitoring')}
        </Badge>
      </div>
    ),
    [lastUpdated, formatLastUpdated, t, locale]
  );

  // KPI Section
  const kpiSection = useMemo(
    () => (
      <KPISection data={kpiData} loading={loading} dateFilter={dateFilter} />
    ),
    [kpiData, loading, dateFilter, t, locale]
  );

  // Controls Section
  const controlsSection = useMemo(
    () => (
      <DashboardControls
        dateFilter={dateFilter}
        loading={loading}
        onDateFilterChange={handleDateFilterChange}
        onRefresh={handleRefresh}
        onExport={handleExportData}
      />
    ),
    [
      dateFilter,
      loading,
      handleDateFilterChange,
      handleRefresh,
      handleExportData,
      t,
      locale,
    ]
  );

  // Charts Section
  const chartsSection = useMemo(
    () => (
      <div className="space-y-6">
        <ChartsSection data={chartData} loading={loading} />
        <SystemInfoSection lastUpdated={lastUpdated} />
      </div>
    ),
    [chartData, loading, lastUpdated, t, locale]
  );

  return (
    <DashboardTemplate
      title={t('dashboard.title')}
      description={t('dashboard.subtitle')}
      headerActions={headerActions}
      kpiSection={kpiSection}
      controlsSection={controlsSection}
      chartsSection={chartsSection}
      loading={loading}
    />
  );
}
