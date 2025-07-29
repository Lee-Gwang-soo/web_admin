import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(
  function LoadingSpinner({ size = 'md', className, text }) {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
        {text && (
          <span className="ml-2 text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    );
  }
);
