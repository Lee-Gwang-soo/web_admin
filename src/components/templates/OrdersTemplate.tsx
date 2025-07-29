'use client';

import { memo, ReactNode } from 'react';
import { AdminPageTemplate } from './AdminPageTemplate';

interface OrdersTemplateProps {
  title: string;
  description?: string;
  headerActions?: ReactNode;
  summarySection: ReactNode;
  controlsSection: ReactNode;
  tableSection: ReactNode;
  modals?: ReactNode;
  className?: string;
  loading?: boolean;
}

export const OrdersTemplate = memo<OrdersTemplateProps>(
  function OrdersTemplate({
    title,
    description,
    headerActions,
    summarySection,
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
          {/* Summary Section */}
          <section aria-label="Orders Summary">{summarySection}</section>

          {/* Controls Section */}
          <section aria-label="Orders Controls">{controlsSection}</section>

          {/* Table Section */}
          <section aria-label="Orders Table">{tableSection}</section>
        </div>

        {/* Modals */}
        {modals}
      </AdminPageTemplate>
    );
  }
);
