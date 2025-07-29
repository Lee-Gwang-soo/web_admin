'use client';

import { KPICard } from '@/components/molecules/KPICard';
import { OrderWithItems } from '@/lib/supabase';
import { useTranslation } from '@/store/i18n-store';
import { motion } from 'framer-motion';
import { CheckSquare, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { memo, useMemo } from 'react';

interface OrdersSummarySectionProps {
  orders: OrderWithItems[];
  loading?: boolean;
}

export const OrdersSummarySection = memo<OrdersSummarySectionProps>(
  function OrdersSummarySection({ orders, loading = false }) {
    const { t, locale } = useTranslation();

    const summaryData = useMemo(() => {
      const totalOrders = orders.length;

      // Calculate revenue excluding cancelled and returned orders
      const validOrders = orders.filter(
        (order) => order.status !== 'cancelled' && order.status !== 'returned'
      );
      const totalRevenue = validOrders.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );

      const pendingOrders = orders.filter(
        (order) => order.status === 'pending'
      ).length;

      const completedOrders = orders.filter(
        (order) => order.status === 'delivered'
      ).length;

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
      };
    }, [orders]);

    const kpiCards = useMemo(
      () => [
        {
          title: t('orders.summary.totalOrders'),
          value: summaryData.totalOrders,
          icon: ShoppingCart,
          color: 'blue',
          description: t('orders.summary.allOrdersCount'),
        },
        {
          title: t('orders.summary.totalRevenue'),
          value: `${summaryData.totalRevenue.toLocaleString()}원`,
          icon: DollarSign,
          color: 'green',
          description: t('orders.summary.excludingCancelled'),
        },
        {
          title: t('orders.summary.pendingOrders'),
          value: summaryData.pendingOrders,
          icon: Package,
          color: 'yellow',
          description: t('orders.summary.awaitingProcessing'),
        },
        {
          title: t('orders.summary.completedOrders'),
          value: summaryData.completedOrders,
          icon: CheckSquare,
          color: 'purple',
          description: t('orders.summary.deliveryCompleted'),
        },
      ],
      [summaryData, t, locale]
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        role="region"
        aria-label="Orders Summary"
      >
        {kpiCards.map((card, index) => (
          <KPICard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            loading={loading}
            description={card.description}
          />
        ))}
      </motion.div>
    );
  }
);
