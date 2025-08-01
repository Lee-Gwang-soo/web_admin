'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface RevenueData {
  hour: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  loading?: boolean;
}

export const RevenueChart = memo<RevenueChartProps>(function RevenueChart({
  data,
  loading = false,
}) {
  const formatCurrency = useMemo(() => {
    return (value: number) => {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        minimumFractionDigits: 0,
      }).format(value);
    };
  }, []);

  const formatTooltip = useMemo(() => {
    return (value: number, name: string) => {
      if (name === 'revenue') {
        return [formatCurrency(value), '매출'];
      }
      return [value, name];
    };
  }, [formatCurrency]);

  const chartConfig = useMemo(
    () => ({
      margin: {
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      },
      strokeDasharray: '3 3',
      strokeColor: '#f0f0f0',
      axisStyle: {
        stroke: '#666',
        fontSize: 12,
        tickLine: false,
        axisLine: false,
      },
      lineStyle: {
        type: 'monotone' as const,
        dataKey: 'revenue',
        stroke: '#3b82f6',
        strokeWidth: 3,
        dot: { fill: '#3b82f6', strokeWidth: 2, r: 4 },
        activeDot: { r: 6, stroke: '#3b82f6', strokeWidth: 2 },
      },
      tooltipStyle: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>시간별 매출 추이</CardTitle>
          <CardDescription>
            선택한 기간의 시간대별 매출 현황을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse flex space-x-4 w-full">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={chartConfig.margin}>
                  <CartesianGrid
                    strokeDasharray={chartConfig.strokeDasharray}
                    stroke={chartConfig.strokeColor}
                  />
                  <XAxis dataKey="hour" {...chartConfig.axisStyle} />
                  <YAxis
                    {...chartConfig.axisStyle}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={formatTooltip}
                    labelFormatter={(label) => `시간: ${label}`}
                    contentStyle={chartConfig.tooltipStyle}
                  />
                  <Line {...chartConfig.lineStyle} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
