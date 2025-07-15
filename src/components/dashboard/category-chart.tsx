'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CategoryData {
  category: string;
  revenue: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
}

export function CategoryChart({ data, loading = false }: CategoryChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltip = (value: number, name: string) => {
    if (name === 'revenue') {
      return [formatCurrency(value), '매출'];
    }
    return [value, name];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 매출</CardTitle>
          <CardDescription>
            상품 카테고리별 매출 현황을 비교해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse flex space-x-4 w-full">
                <div className="rounded bg-gray-200 h-48 w-16"></div>
                <div className="rounded bg-gray-200 h-32 w-16"></div>
                <div className="rounded bg-gray-200 h-40 w-16"></div>
                <div className="rounded bg-gray-200 h-24 w-16"></div>
                <div className="rounded bg-gray-200 h-36 w-16"></div>
              </div>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="category"
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={formatTooltip}
                    labelFormatter={(label) => `카테고리: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
