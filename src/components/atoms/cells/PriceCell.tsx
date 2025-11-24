import { memo } from 'react';

interface PriceCellProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
}

export const PriceCell = memo<PriceCellProps>(function PriceCell({
  amount,
  currency = 'KRW',
  locale = 'ko-KR',
  className = '',
}) {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);

  return <span className={`font-medium ${className}`}>{formatted}</span>;
});
