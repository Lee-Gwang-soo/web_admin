'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/store/i18n-store';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface SystemInfoSectionProps {
  lastUpdated?: Date | null;
}

export const SystemInfoSection = memo<SystemInfoSectionProps>(
  function SystemInfoSection({ lastUpdated }) {
    const { t } = useTranslation();

    const formatLastUpdated = (date: Date | null) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        role="region"
        aria-label="System Information"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.systemInfo.title')}</CardTitle>
            <CardDescription>
              {t('dashboard.systemInfo.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('dashboard.systemInfo.autoRefresh')}
              </span>
              <Badge variant="secondary">
                {t('dashboard.systemInfo.oneMinuteInterval')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('dashboard.systemInfo.dataSource')}
              </span>
              <Badge variant="secondary">Supabase</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('dashboard.systemInfo.connectionStatus')}
              </span>
              <Badge
                variant="secondary"
                className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20"
              >
                {t('dashboard.systemInfo.connected')}
              </Badge>
            </div>
            {lastUpdated && (
              <div className="flex items-center justify-between md:col-span-3">
                <span className="text-sm font-medium">
                  {t('dashboard.lastUpdated')}
                </span>
                <Badge variant="outline">
                  {formatLastUpdated(lastUpdated)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
