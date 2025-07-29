import { cn } from '@/lib/utils';
import { memo } from 'react';

interface SuspenseFallbackProps {
  variant?: 'card' | 'table' | 'page' | 'inline';
  className?: string;
  rows?: number;
}

export const SuspenseFallback = memo<SuspenseFallbackProps>(
  function SuspenseFallback({ variant = 'card', className, rows = 3 }) {
    const skeletonClass = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

    if (variant === 'inline') {
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <div className={cn(skeletonClass, 'h-4 w-4 rounded-full')} />
          <div className={cn(skeletonClass, 'h-4 flex-1')} />
        </div>
      );
    }

    if (variant === 'table') {
      return (
        <div className={cn('space-y-3', className)}>
          {/* Table header skeleton */}
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn(skeletonClass, 'h-4 flex-1')} />
            ))}
          </div>
          {/* Table rows skeleton */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className={cn(skeletonClass, 'h-4 flex-1')} />
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (variant === 'page') {
      return (
        <div className={cn('space-y-6 p-6', className)}>
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className={cn(skeletonClass, 'h-8 w-1/3')} />
            <div className={cn(skeletonClass, 'h-4 w-1/2')} />
          </div>

          {/* KPI cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className={cn(skeletonClass, 'h-4 w-20')} />
                  <div className={cn(skeletonClass, 'h-4 w-4 rounded')} />
                </div>
                <div className={cn(skeletonClass, 'h-8 w-16')} />
                <div className={cn(skeletonClass, 'h-3 w-24')} />
              </div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="border rounded-lg p-6">
            <div className="space-y-4">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className={cn(skeletonClass, 'h-12 w-12 rounded')} />
                  <div className="flex-1 space-y-2">
                    <div className={cn(skeletonClass, 'h-4 w-3/4')} />
                    <div className={cn(skeletonClass, 'h-3 w-1/2')} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default card variant
    return (
      <div className={cn('p-6 border rounded-lg space-y-4', className)}>
        <div className="space-y-2">
          <div className={cn(skeletonClass, 'h-6 w-1/3')} />
          <div className={cn(skeletonClass, 'h-4 w-1/2')} />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={cn(skeletonClass, 'h-4 w-full')} />
        ))}
      </div>
    );
  }
);
