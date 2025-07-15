'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { OrderStatusChart } from '@/components/dashboard/order-status-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { useDashboardStore } from '@/store/dashboard-store';
import { useAuthStore } from '@/store/auth-store';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  RefreshCw,
  Download,
  Calendar,
  LogOut,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut } = useAuthStore();
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
    // CSV/Excel 내보내기 로직 (추후 구현)
    console.log('Exporting data...');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                E-commerce 대시보드
              </h1>
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

              <span className="text-sm text-gray-600">{user?.email}</span>

              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-between items-center mb-8"
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
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              새로고침
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              데이터 내보내기
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <KPICard
            title="오늘 매출"
            value={kpiData.todayRevenue}
            change={12.5}
            trend="up"
            icon={DollarSign}
            loading={loading}
            description="전일 대비 증가"
          />
          <KPICard
            title="오늘 주문 수"
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
            <CategoryChart data={chartData.categoryRevenue} loading={loading} />
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>시스템 정보</CardTitle>
              <CardDescription>대시보드 상태 및 설정 정보</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">자동 새로고침</span>
                <Badge variant="secondary">5초 간격</Badge>
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
      </main>
    </div>
  );
}
