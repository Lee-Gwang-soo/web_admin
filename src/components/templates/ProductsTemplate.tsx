'use client';

import { memo, ReactNode } from 'react';
import { AdminPageTemplate } from './AdminPageTemplate';

interface ProductsTemplateProps {
  title: string;
  description?: string;
  headerActions?: ReactNode;
  kpiSection?: ReactNode;
  controlsSection: ReactNode;
  tableSection: ReactNode;
  modals?: ReactNode;
  className?: string;
  loading?: boolean;
}

export const ProductsTemplate = memo<ProductsTemplateProps>(
  function ProductsTemplate({
    title,
    description,
    headerActions,
    kpiSection,
    controlsSection,
    tableSection,
    modals,
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
          {/* KPI Section (optional) */}
          {kpiSection && (
            <section aria-label="Products KPI">{kpiSection}</section>
          )}

          {/* Controls Section */}
          <section aria-label="Products Controls">{controlsSection}</section>

          {/* Table Section */}
          <section aria-label="Products Table">{tableSection}</section>
        </div>

        {/* Modals */}
        {modals}
      </AdminPageTemplate>
    );
  }
);
