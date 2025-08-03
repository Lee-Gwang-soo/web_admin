'use client';

import { KPICard } from '@/components/dashboard/kpi-card';
import { useTranslation } from '@/store/i18n-store';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { memo, useMemo } from 'react';

interface KPIData {
  todayRevenue: number;
  todayOrders: number;
  activeUsers: number;
  conversionRate: number;
}

interface KPISectionProps {
  data: KPIData;
  loading?: boolean;
  dateFilter: 'today' | 'yesterday' | 'week';
}

export const KPISection = memo<KPISectionProps>(function KPISection({
  data,
  loading = false,
  dateFilter,
}) {
  const { t, locale } = useTranslation();

  const getKPITitle = useMemo(() => {
    return (type: 'revenue' | 'orders') => {
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
  }, [dateFilter, t, locale]);

  const kpiCards = useMemo(
    () => [
      {
        title: getKPITitle('revenue'),
        value: data.todayRevenue,
        change: 12.5,
        trend: 'up' as const,
        icon: DollarSign,
        description: t('dashboard.kpi.previousDayComparison'),
      },
      {
        title: getKPITitle('orders'),
        value: data.todayOrders,
        change: 8.2,
        trend: 'up' as const,
        icon: ShoppingCart,
        description: t('dashboard.kpi.newOrders'),
      },
      {
        title: t('dashboard.kpi.activeUsers'),
        value: data.activeUsers,
        change: -2.1,
        trend: 'down' as const,
        icon: Users,
        description: t('dashboard.kpi.currentlyOnline'),
      },
      {
        title: t('dashboard.kpi.conversionRate'),
        value: data.conversionRate,
        change: 5.7,
        trend: 'up' as const,
        icon: TrendingUp,
        description: t('dashboard.kpi.visitorComparison'),
      },
    ],
    [data, getKPITitle, t, locale]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      role="region"
      aria-label="Key Performance Indicators"
    >
      {kpiCards.map((card, index) => (
        <KPICard
          key={card.title}
          title={card.title}
          value={card.value}
          change={card.change}
          trend={card.trend}
          icon={card.icon}
          loading={loading}
          description={card.description}
          dateFilter={dateFilter}
        />
      ))}
    </motion.div>
  );
});
