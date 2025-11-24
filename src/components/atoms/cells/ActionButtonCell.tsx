import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { memo } from 'react';

interface ActionButtonCellProps {
  icon: LucideIcon;
  onClick: () => void;
  label: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const ActionButtonCell = memo<ActionButtonCellProps>(
  function ActionButtonCell({
    icon: Icon,
    onClick,
    label,
    variant = 'ghost',
    size = 'sm',
    className = '',
  }) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        className={`h-8 w-8 p-0 ${className}`}
        aria-label={label}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  }
);
