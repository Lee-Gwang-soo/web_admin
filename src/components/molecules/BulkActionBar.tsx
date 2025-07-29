import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CheckSquare } from 'lucide-react';
import { memo, ReactNode } from 'react';

interface BulkAction {
  id: string;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface BulkSelectOption {
  value: string;
  label: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions?: BulkAction[];
  selectOptions?: {
    value: string;
    onValueChange: (value: string) => void;
    options: BulkSelectOption[];
    placeholder?: string;
  };
  className?: string;
}

export const BulkActionBar = memo<BulkActionBarProps>(function BulkActionBar({
  selectedCount,
  onClearSelection,
  actions = [],
  selectOptions,
  className,
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-400">
              {selectedCount} items selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="text-blue-600 border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              Clear Selection
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Select dropdown for bulk actions */}
          {selectOptions && (
            <Select
              value={selectOptions.value}
              onValueChange={selectOptions.onValueChange}
            >
              <SelectTrigger className="w-full sm:w-40 h-10">
                <SelectValue placeholder={selectOptions.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'default'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="flex-1 sm:flex-none h-10"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
