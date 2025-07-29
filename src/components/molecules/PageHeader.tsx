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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                {description}
              </p>
            )}
            {badges && badges.length > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant={badge.variant || 'secondary'}>
                    {badge.text}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
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
