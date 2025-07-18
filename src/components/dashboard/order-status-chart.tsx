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
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface OrderStatusData {
  status: string;
  count: number;
  color: string;
}

interface OrderStatusChartProps {
  data: OrderStatusData[];
  loading?: boolean;
}

export const OrderStatusChart = memo<OrderStatusChartProps>(
  function OrderStatusChart({ data, loading = false }) {
    const formatTooltip = useMemo(() => {
      return (value: number, name: string) => {
        return [`${value}건`, name];
      };
    }, []);

    const chartConfig = useMemo(
      () => ({
        pieConfig: {
          dataKey: 'count',
          cx: '50%',
          cy: '50%',
          labelLine: false,
          outerRadius: 80,
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

    const labelFormatter = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const LabelComponent = (entry: any) => {
        const RADIAN = Math.PI / 180;
        const radius =
          entry.innerRadius + (entry.outerRadius - entry.innerRadius) * 0.5;
        const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN);
        const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN);

        return entry.count > 0 ? (
          <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > entry.cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={12}
            fontWeight="bold"
          >
            {entry.count}
          </text>
        ) : null;
      };
      LabelComponent.displayName = 'LabelComponent';
      return LabelComponent;
    }, []);

    const legendFormatter = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const LegendComponent = (value: string, entry: any) => (
        <span style={{ color: entry.color }}>
          {value} ({entry.payload.count}건)
        </span>
      );
      LegendComponent.displayName = 'LegendComponent';
      return LegendComponent;
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>주문 상태별 분포</CardTitle>
            <CardDescription>주문 상태별 현황을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse">
                  <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      {...chartConfig.pieConfig}
                      label={labelFormatter}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={formatTooltip}
                      contentStyle={chartConfig.tooltipStyle}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={legendFormatter}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
