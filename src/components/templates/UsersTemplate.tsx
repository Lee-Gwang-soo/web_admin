'use client';

import { memo, ReactNode } from 'react';
import { AdminPageTemplate } from './AdminPageTemplate';

interface UsersTemplateProps {
  title: string;
  description?: string;
  headerActions?: ReactNode;
  controlsSection: ReactNode;
  tableSection: ReactNode;
  modals?: ReactNode;
  className?: string;
  loading?: boolean;
}

export const UsersTemplate = memo<UsersTemplateProps>(function UsersTemplate({
  title,
  description,
  headerActions,
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
        {/* Controls Section */}
        <section aria-label="Users Controls">{controlsSection}</section>

        {/* Table Section */}
        <section aria-label="Users Table">{tableSection}</section>
      </div>

      {/* Modals */}
      {modals}
    </AdminPageTemplate>
  );
});
