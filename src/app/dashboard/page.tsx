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
          ['지표', '값'],
          ['오늘 매출', kpiData.todayRevenue],
          ['오늘 주문 수', kpiData.todayOrders],
          ['활성 사용자 수', kpiData.activeUsers],
          ['전환율', kpiData.conversionRate],
        ];

        // 시간별 매출 데이터 시트
        const hourlyRevenueData = [
          ['시간', '매출'],
          ...chartData.hourlyRevenue.map((item) => [item.hour, item.revenue]),
        ];

        // 주문 상태 분포 데이터 시트
        const orderStatusData = [
          ['상태', '수량'],
          ...chartData.orderStatusDistribution.map((item) => [
            item.status,
            item.count,
          ]),
        ];

        // 카테고리별 매출 데이터 시트
        const categoryRevenueData = [
          ['카테고리', '매출'],
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
        XLSX.utils.book_append_sheet(workbook, kpiWorksheet, 'KPI 지표');

        // 시간별 매출 워크시트 생성 및 추가
        const hourlyWorksheet = XLSX.utils.aoa_to_sheet(hourlyRevenueData);
        hourlyWorksheet['!cols'] = [{ wch: 10 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, hourlyWorksheet, '시간별 매출');

        // 주문 상태 워크시트 생성 및 추가
        const statusWorksheet = XLSX.utils.aoa_to_sheet(orderStatusData);
        statusWorksheet['!cols'] = [{ wch: 15 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(workbook, statusWorksheet, '주문 상태');

        // 카테고리별 매출 워크시트 생성 및 추가
        const categoryWorksheet = XLSX.utils.aoa_to_sheet(categoryRevenueData);
        categoryWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(
          workbook,
          categoryWorksheet,
          '카테고리별 매출'
        );

        // Excel 파일 생성 및 다운로드
        const fileName = `dashboard_data_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        console.log('✅ Dashboard data exported to Excel successfully');
      })
      .catch((error) => {
        console.error('❌ Error exporting dashboard data:', error);
        alert('데이터 내보내기 중 오류가 발생했습니다.');
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

  return (
    <AdminLayout>
      <div className="h-full bg-gray-50">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-gray-200 px-6 py-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
              <p className="text-sm text-gray-600">
                실시간 비즈니스 인사이트와 데이터 모니터링
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                  <span>마지막 업데이트: {formatLastUpdated(lastUpdated)}</span>
                </div>
              )}
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                실시간 모니터링 중
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
              <Calendar className="h-5 w-5 text-gray-500" />
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
                  <SelectItem value="today">오늘</SelectItem>
                  <SelectItem value="yesterday">어제</SelectItem>
                  <SelectItem value="week">최근 7일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={fetchDashboardData}
                disabled={loading}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                새로고침
              </Button>
              <Button
                variant="outline"
                onClick={handleExportData}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel로 내보내기
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
              title={
                dateFilter === 'today'
                  ? '오늘 매출'
                  : dateFilter === 'yesterday'
                    ? '어제 매출'
                    : '최근 7일 매출'
              }
              value={kpiData.todayRevenue}
              change={12.5}
              trend="up"
              icon={DollarSign}
              loading={loading}
              description="전일 대비 증가"
            />
            <KPICard
              title={
                dateFilter === 'today'
                  ? '오늘 주문 수'
                  : dateFilter === 'yesterday'
                    ? '어제 주문 수'
                    : '최근 7일 주문 수'
              }
              value={kpiData.todayOrders}
              change={8.2}
              trend="up"
              icon={ShoppingCart}
              loading={loading}
              description="새로운 주문"
            />
            <KPICard
              title="활성 사용자 수"
              value={kpiData.activeUsers}
              change={-2.1}
              trend="down"
              icon={Users}
              loading={loading}
              description="현재 접속 중"
            />
            <KPICard
              title="전환율"
              value={kpiData.conversionRate}
              change={5.7}
              trend="up"
              icon={TrendingUp}
              loading={loading}
              description="방문자 대비"
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
                <CardTitle>시스템 정보</CardTitle>
                <CardDescription>대시보드 상태 및 설정 정보</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">자동 새로고침</span>
                  <Badge variant="secondary">1분 간격</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">데이터 소스</span>
                  <Badge variant="secondary">Supabase</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">연결 상태</span>
                  <Badge
                    variant="secondary"
                    className="text-green-600 bg-green-100"
                  >
                    연결됨
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
