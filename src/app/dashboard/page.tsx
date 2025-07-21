'use client';

import { CategoryChart } from '@/components/dashboard/category-chart';
import { KPICard } from '@/components/dashboard/kpi-card';
import { OrderStatusChart } from '@/components/dashboard/order-status-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardStore } from '@/store/dashboard-store';
import { useTranslation } from '@/store/i18n-store';
import { motion } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  Download,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { t } = useTranslation();
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

  useEffect(() => {
    // 초기 데이터 로드
    fetchDashboardData();

    // 실시간 업데이트 시작
    startRealTimeUpdates();

    // 컴포넌트 언마운트 시 실시간 업데이트 중단
    return () => {
      stopRealTimeUpdates();
    };
  }, [fetchDashboardData, startRealTimeUpdates, stopRealTimeUpdates]);

  const handleExportData = () => {
    // 대시보드 데이터를 Excel로 내보내기
    import('xlsx')
      .then((XLSX) => {
        // KPI 데이터 시트
        const kpiData_sheet = [
          [t('common.metrics'), t('common.value')],
          [t('dashboard.kpi.todayRevenue'), kpiData.todayRevenue],
          [t('dashboard.kpi.todayOrders'), kpiData.todayOrders],
          [t('dashboard.kpi.activeUsers'), kpiData.activeUsers],
          [t('dashboard.kpi.conversionRate'), kpiData.conversionRate],
        ];

        // 시간별 매출 데이터 시트
        const hourlyRevenueData = [
          [t('common.time'), t('common.revenue')],
          ...chartData.hourlyRevenue.map((item) => [item.hour, item.revenue]),
        ];

        // 주문 상태 분포 데이터 시트
        const orderStatusData = [
          [t('orders.status'), t('common.count')],
          ...chartData.orderStatusDistribution.map((item) => [
            item.status,
            item.count,
          ]),
        ];

        // 카테고리별 매출 데이터 시트
        const categoryRevenueData = [
          [t('products.category'), t('common.revenue')],
          ...chartData.categoryRevenue.map((item) => [
            item.category,
            item.revenue,
          ]),
        ];

        // 워크북 생성
        const workbook = XLSX.utils.book_new();

        // KPI 워크시트 생성 및 추가
        const kpiWorksheet = XLSX.utils.aoa_to_sheet(kpiData_sheet);
        kpiWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(
          workbook,
          kpiWorksheet,
          t('dashboard.kpi.title')
        );

        // 시간별 매출 워크시트 생성 및 추가
        const hourlyWorksheet = XLSX.utils.aoa_to_sheet(hourlyRevenueData);
        hourlyWorksheet['!cols'] = [{ wch: 10 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(
          workbook,
          hourlyWorksheet,
          t('dashboard.charts.hourlyRevenue')
        );

        // 주문 상태 워크시트 생성 및 추가
        const statusWorksheet = XLSX.utils.aoa_to_sheet(orderStatusData);
        statusWorksheet['!cols'] = [{ wch: 15 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(
          workbook,
          statusWorksheet,
          t('orders.status')
        );

        // 카테고리별 매출 워크시트 생성 및 추가
        const categoryWorksheet = XLSX.utils.aoa_to_sheet(categoryRevenueData);
        categoryWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(
          workbook,
          categoryWorksheet,
          t('dashboard.charts.categoryRevenue')
        );

        // Excel 파일 생성 및 다운로드
        const fileName = `dashboard_data_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        console.log('✅ Dashboard data exported to Excel successfully');
      })
      .catch((error) => {
        console.error('❌ Error exporting dashboard data:', error);
        alert(t('messages.dataLoadError'));
      });
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getKPITitle = (type: 'revenue' | 'orders') => {
    const baseKey =
      type === 'revenue'
        ? 'dashboard.kpi.todayRevenue'
        : 'dashboard.kpi.todayOrders';

    switch (dateFilter) {
      case 'today':
        return t(baseKey);
      case 'yesterday':
        return t(baseKey.replace('today', 'yesterday'));
      case 'week':
        return t(baseKey.replace('today', 'week'));
      default:
        return t(baseKey);
    }
  };

  return (
    <AdminLayout>
      <div className="h-full bg-background dark:bg-background">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card dark:bg-card border-b border-border dark:border-border px-6 py-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground dark:text-foreground">
                {t('dashboard.title')}
              </h1>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                {t('dashboard.subtitle')}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  <span>
                    {t('dashboard.lastUpdated')}:{' '}
                    {formatLastUpdated(lastUpdated)}
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
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="p-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-between items-center mb-6"
          >
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
              <Select
                value={dateFilter}
                onValueChange={(value: 'today' | 'yesterday' | 'week') =>
                  setDateFilter(value)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">
                    {t('dashboard.dateFilter.today')}
                  </SelectItem>
                  <SelectItem value="yesterday">
                    {t('dashboard.dateFilter.yesterday')}
                  </SelectItem>
                  <SelectItem value="week">
                    {t('dashboard.dateFilter.week')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={fetchDashboardData}
                disabled={loading}
                className="cursor-pointer hover:bg-accent dark:hover:bg-accent transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                {t('common.refresh')}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportData}
                className="cursor-pointer hover:bg-accent dark:hover:bg-accent transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('dashboard.exportExcel')}
              </Button>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
          >
            <KPICard
              title={getKPITitle('revenue')}
              value={kpiData.todayRevenue}
              change={12.5}
              trend="up"
              icon={DollarSign}
              loading={loading}
              description={t('dashboard.kpi.previousDayComparison')}
            />
            <KPICard
              title={getKPITitle('orders')}
              value={kpiData.todayOrders}
              change={8.2}
              trend="up"
              icon={ShoppingCart}
              loading={loading}
              description={t('dashboard.kpi.newOrders')}
            />
            <KPICard
              title={t('dashboard.kpi.activeUsers')}
              value={kpiData.activeUsers}
              change={-2.1}
              trend="down"
              icon={Users}
              loading={loading}
              description={t('dashboard.kpi.currentlyOnline')}
            />
            <KPICard
              title={t('dashboard.kpi.conversionRate')}
              value={kpiData.conversionRate}
              change={5.7}
              trend="up"
              icon={TrendingUp}
              loading={loading}
              description={t('dashboard.kpi.visitorComparison')}
            />
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Revenue Chart - 전체 너비 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-2"
            >
              <RevenueChart data={chartData.hourlyRevenue} loading={loading} />
            </motion.div>

            {/* Order Status Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <OrderStatusChart
                data={chartData.orderStatusDistribution}
                loading={loading}
              />
            </motion.div>

            {/* Category Chart - 전체 너비 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 xl:col-span-3"
            >
              <CategoryChart
                data={chartData.categoryRevenue}
                loading={loading}
              />
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.systemInfo.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.systemInfo.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('dashboard.systemInfo.autoRefresh')}
                  </span>
                  <Badge variant="secondary">
                    {t('dashboard.systemInfo.oneMinuteInterval')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('dashboard.systemInfo.dataSource')}
                  </span>
                  <Badge variant="secondary">Supabase</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('dashboard.systemInfo.connectionStatus')}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20"
                  >
                    {t('dashboard.systemInfo.connected')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
