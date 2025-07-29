import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { memo } from 'react';

type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary'
  | 'outline';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusVariant, string> = {
  success:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  warning:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  danger:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  secondary:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
  outline: 'border-2 bg-transparent',
};

export const StatusBadge = memo<StatusBadgeProps>(function StatusBadge({
  variant,
  children,
  className,
}) {
  return (
    <Badge className={cn(statusStyles[variant], 'border-0', className)}>
      {children}
    </Badge>
  );
});
