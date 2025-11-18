'use client';

import { CategoryChart } from '@/components/dashboard/category-chart';
import { CategorySalesChart } from '@/components/dashboard/category-sales-chart';
import { OrderStatusChart } from '@/components/dashboard/order-status-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface ChartData {
  hourlyRevenue: Array<{
    hour: string;
    revenue: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  categoryRevenue: Array<{
    category: string;
    revenue: number;
  }>;
  categorySales: Array<{
    category: string;
    count: number;
  }>;
}

interface ChartsSectionProps {
  data: ChartData;
  loading?: boolean;
}

export const ChartsSection = memo<ChartsSectionProps>(function ChartsSection({
  data,
  loading = false,
}) {
  return (
    <div className="space-y-6" role="region" aria-label="Analytics Charts">
      {/* Top Row: Revenue Chart and Order Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Revenue Chart - spans 2 columns on xl screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2"
        >
          <RevenueChart data={data.hourlyRevenue} loading={loading} />
        </motion.div>

        {/* Order Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <OrderStatusChart
            data={data.orderStatusDistribution}
            loading={loading}
          />
        </motion.div>
      </div>

      {/* Bottom Row: Category Revenue and Category Sales Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <CategoryChart data={data.categoryRevenue} loading={loading} />
        </motion.div>

        {/* Category Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CategorySalesChart data={data.categorySales} loading={loading} />
        </motion.div>
      </div>
    </div>
  );
});
