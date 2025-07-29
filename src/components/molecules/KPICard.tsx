import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { memo } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  loading?: boolean;
  className?: string;
  valueFormatter?: (value: string | number) => string;
}

export const KPICard = memo<KPICardProps>(function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
  className,
  valueFormatter = (val) => val.toString(),
}) {
  const formatTrendValue = (trendValue: number) => {
    return `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <LoadingSpinner size="md" text="Loading..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valueFormatter(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive !== false ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive !== false ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatTrendValue(trend.value)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
