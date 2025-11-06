'use client';

import { KPICard } from '@/components/dashboard/kpi-card';
import { useTranslation } from '@/store/i18n-store';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, XCircle, PackageX } from 'lucide-react';
import { memo, useMemo } from 'react';

interface KPIData {
  todayRevenue: number;
  todayOrders: number;
  refunds: number;
  returns: number;
  revenueChange: number;
  ordersChange: number;
  refundsChange: number;
  returnsChange: number;
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
    return (type: 'revenue' | 'orders' | 'refunds' | 'returns') => {
      let baseKey = '';
      switch (type) {
        case 'revenue':
          baseKey = 'dashboard.kpi.todayRevenue';
          break;
        case 'orders':
          baseKey = 'dashboard.kpi.todayOrders';
          break;
        case 'refunds':
          baseKey = 'dashboard.kpi.todayRefunds';
          break;
        case 'returns':
          baseKey = 'dashboard.kpi.todayReturns';
          break;
      }

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

  const kpiCards = useMemo(() => {
    const revenueTrend: 'up' | 'down' = data.revenueChange >= 0 ? 'up' : 'down';
    const ordersTrend: 'up' | 'down' = data.ordersChange >= 0 ? 'up' : 'down';
    const refundsTrend: 'up' | 'down' = data.refundsChange <= 0 ? 'up' : 'down';
    const returnsTrend: 'up' | 'down' = data.returnsChange <= 0 ? 'up' : 'down';

    return [
      {
        title: getKPITitle('revenue'),
        value: data.todayRevenue,
        change: data.revenueChange,
        trend: revenueTrend,
        icon: DollarSign,
        description: t('dashboard.kpi.newOrders'),
      },
      {
        title: getKPITitle('orders'),
        value: data.todayOrders,
        change: data.ordersChange,
        trend: ordersTrend,
        icon: ShoppingCart,
        description: t('dashboard.kpi.newOrders'),
      },
      {
        title: getKPITitle('refunds'),
        value: data.refunds,
        change: data.refundsChange,
        trend: refundsTrend,
        icon: XCircle,
        description: t('dashboard.kpi.cancelledOrders'),
      },
      {
        title: getKPITitle('returns'),
        value: data.returns,
        change: data.returnsChange,
        trend: returnsTrend,
        icon: PackageX,
        description: t('dashboard.kpi.returnedOrders'),
      },
    ];
  }, [data, getKPITitle, t, locale]);

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
