import { memo } from 'react';

interface DateCellProps {
  date: string | Date;
  locale?: string;
  className?: string;
}

export const DateCell = memo<DateCellProps>(function DateCell({
  date,
  locale = 'ko-KR',
  className = '',
}) {
  const formattedDate = new Date(date).toLocaleDateString(locale);

  return <span className={className}>{formattedDate}</span>;
});
