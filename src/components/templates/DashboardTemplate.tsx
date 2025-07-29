'use client';

import { memo, ReactNode } from 'react';
import { AdminPageTemplate } from './AdminPageTemplate';

interface DashboardTemplateProps {
  title: string;
  description?: string;
  headerActions?: ReactNode;
  kpiSection: ReactNode;
  controlsSection: ReactNode;
  chartsSection: ReactNode;
  className?: string;
  loading?: boolean;
}

export const DashboardTemplate = memo<DashboardTemplateProps>(
  function DashboardTemplate({
    title,
    description,
    headerActions,
    kpiSection,
    controlsSection,
    chartsSection,
    className,
    loading = false,
  }) {
    return (
      <AdminPageTemplate
        title={title}
        description={description}
        headerActions={headerActions}
        className={className}
        loading={loading}
        noPadding
      >
        <div className="space-y-6 p-6">
          {/* KPI Section */}
          <section aria-label="Key Performance Indicators">
            {kpiSection}
          </section>

          {/* Controls Section */}
          <section aria-label="Dashboard Controls">{controlsSection}</section>

          {/* Charts Section */}
          <section aria-label="Analytics Charts">{chartsSection}</section>
        </div>
      </AdminPageTemplate>
    );
  }
);
