import { StatusBadge } from '@/components/atoms';
import { memo } from 'react';

interface StockBadgeCellProps {
  stock: number;
  labels: {
    inStock: string;
    lowStock: string;
    outOfStock: string;
  };
}

export const StockBadgeCell = memo<StockBadgeCellProps>(
  function StockBadgeCell({ stock, labels }) {
    const getVariant = (): 'success' | 'warning' | 'danger' => {
      if (stock === 0) return 'danger';
      if (stock < 10) return 'warning';
      return 'success';
    };

    const getLabel = (): string => {
      if (stock === 0) return labels.outOfStock;
      if (stock < 10) return labels.lowStock;
      return labels.inStock;
    };

    return <StatusBadge variant={getVariant()}>{getLabel()}</StatusBadge>;
  }
);
