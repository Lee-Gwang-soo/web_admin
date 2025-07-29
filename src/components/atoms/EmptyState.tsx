import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { memo, ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = memo<EmptyStateProps>(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn('text-center py-12', className)}>
      <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
});
