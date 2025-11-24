import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { memo, ReactNode, useMemo } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  badges?: Array<{
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
  className?: string;
  animated?: boolean;
}

// 안정적인 애니메이션 설정 - 컴포넌트 외부로 이동
const HEADER_ANIMATION_CONFIG = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export const PageHeader = memo<PageHeaderProps>(function PageHeader({
  title,
  description,
  actions,
  badges,
  className,
  animated = true,
}) {
  // 클래스 계산 memoization
  const containerClasses = useMemo(
    () =>
      cn(
        'bg-card dark:bg-card border-b border-border dark:border-border px-6 py-4',
        className
      ),
    [className]
  );

  // Content memoization
  const content = useMemo(
    () => (
      <div className={containerClasses}>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground break-words">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground dark:text-muted-foreground break-words">
                {description}
              </p>
            )}
            {badges && badges.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant={badge.variant || 'secondary'}>
                    {badge.text}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {actions && (
            <div className="flex items-center flex-wrap gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    ),
    [containerClasses, title, description, badges, actions]
  );

  // 애니메이션 적용 여부에 따른 렌더링
  if (animated) {
    return <motion.div {...HEADER_ANIMATION_CONFIG}>{content}</motion.div>;
  }

  return content;
});
