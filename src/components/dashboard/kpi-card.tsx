'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { memo, useMemo } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export const KPICard = memo<KPICardProps>(function KPICard({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend = 'neutral',
  loading = false,
}) {
  const formatValue = useMemo(() => {
    return (val: string | number) => {
      if (typeof val === 'number') {
        if (title.includes('매출') || title.includes('Revenue')) {
          return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0,
          }).format(val);
        }
        if (title.includes('율') || title.includes('Rate')) {
          return `${val.toFixed(1)}%`;
        }
        return new Intl.NumberFormat('ko-KR').format(val);
      }
      return val;
    };
  }, [title]);

  const trendColor = useMemo(() => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, [trend]);

  const trendIcon = useMemo(() => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  }, [trend]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatValue(value)}</div>
            )}

            {change !== undefined && !loading && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={trendColor}>
                  <span className="mr-1">{trendIcon}</span>
                  {Math.abs(change).toFixed(1)}%
                </Badge>
                <span className="text-xs text-muted-foreground">전일 대비</span>
              </div>
            )}

            {description && !loading && (
              <p className="text-xs text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
