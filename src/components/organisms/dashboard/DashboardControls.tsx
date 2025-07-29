'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/store/i18n-store';
import { motion } from 'framer-motion';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import { memo, useCallback } from 'react';

interface DashboardControlsProps {
  dateFilter: 'today' | 'yesterday' | 'week';
  loading?: boolean;
  onDateFilterChange: (value: 'today' | 'yesterday' | 'week') => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const DashboardControls = memo<DashboardControlsProps>(
  function DashboardControls({
    dateFilter,
    loading = false,
    onDateFilterChange,
    onRefresh,
    onExport,
  }) {
    const { t } = useTranslation();

    const handleRefresh = useCallback(() => {
      onRefresh();
    }, [onRefresh]);

    const handleExport = useCallback(() => {
      onExport();
    }, [onExport]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-center"
        role="region"
        aria-label="Dashboard Controls"
      >
        <div className="flex items-center space-x-4">
          <Calendar
            className="h-5 w-5 text-muted-foreground dark:text-muted-foreground"
            aria-hidden="true"
          />
          <Select
            value={dateFilter}
            onValueChange={onDateFilterChange}
            aria-label={t('dashboard.dateFilter.label')}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">
                {t('dashboard.dateFilter.today')}
              </SelectItem>
              <SelectItem value="yesterday">
                {t('dashboard.dateFilter.yesterday')}
              </SelectItem>
              <SelectItem value="week">
                {t('dashboard.dateFilter.week')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="cursor-pointer hover:bg-accent dark:hover:bg-accent transition-colors"
            aria-label={t('common.refresh')}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {t('common.refresh')}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading}
            className="cursor-pointer hover:bg-accent dark:hover:bg-accent transition-colors"
            aria-label={t('dashboard.exportExcel')}
          >
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('dashboard.exportExcel')}
          </Button>
        </div>
      </motion.div>
    );
  }
);
