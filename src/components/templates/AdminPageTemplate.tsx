'use client';

import { SuspenseFallback } from '@/components/atoms/SuspenseFallback';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ErrorBoundary } from '@/components/molecules/ErrorBoundary';
import { PageHeader } from '@/components/molecules/PageHeader';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { memo, ReactNode, Suspense, useCallback, useMemo } from 'react';

interface AdminPageTemplateProps {
  // Header props
  title: string;
  description?: string;
  headerActions?: ReactNode;
  headerBadges?: Array<{
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;

  // Content props
  children: ReactNode;
  className?: string;

  // Layout options
  fullWidth?: boolean;
  noPadding?: boolean;
  animated?: boolean;

  // Error handling
  errorFallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;

  // Loading
  loading?: boolean;
  loadingFallback?: ReactNode;
}

// 안정적인 애니메이션 설정 - 컴포넌트 외부로 이동
const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export const AdminPageTemplate = memo<AdminPageTemplateProps>(
  function AdminPageTemplate({
    title,
    description,
    headerActions,
    headerBadges,
    children,
    className,
    fullWidth = false,
    noPadding = false,
    animated = true,
    errorFallback,
    onError,
    loading = false,
    loadingFallback,
  }) {
    // 클래스 계산 memoization
    const containerClasses = useMemo(
      () => cn('min-h-screen bg-background dark:bg-background', className),
      [className]
    );

    const contentClasses = useMemo(
      () => cn('flex-1', !noPadding && 'p-6'),
      [noPadding]
    );

    // 로딩 fallback memoization
    const defaultLoadingFallback = useMemo(
      () => <SuspenseFallback variant="page" />,
      []
    );

    // 실제 로딩 fallback 결정
    const actualLoadingFallback = loadingFallback || defaultLoadingFallback;

    // 애니메이션 props memoization
    const animationProps = useMemo(
      () => (animated ? ANIMATION_CONFIG : {}),
      [animated]
    );

    // Content 렌더링 최적화
    const renderContent = useCallback(() => {
      if (loading) {
        return actualLoadingFallback;
      }

      if (animated) {
        return <motion.div {...animationProps}>{children}</motion.div>;
      }

      return children;
    }, [loading, animated, animationProps, children, actualLoadingFallback]);

    return (
      <AdminLayout>
        <div className={containerClasses}>
          {/* Page Header - 독립적으로 memoized */}
          <PageHeader
            title={title}
            description={description}
            actions={headerActions}
            badges={headerBadges}
            animated={animated}
          />

          {/* Main Content - 최적화된 구조 */}
          <main className={contentClasses}>
            <ErrorBoundary fallback={errorFallback} onError={onError}>
              <Suspense fallback={actualLoadingFallback}>
                {renderContent()}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </AdminLayout>
    );
  }
);
