'use client';

import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable } from '@/components/organisms/DataTable';
import { UsersTemplate } from '@/components/templates/UsersTemplate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/store/i18n-store';
import { useUsersStore } from '@/store/users-store';
import { motion } from 'framer-motion';
import { Eye, RefreshCw, Users as UsersIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function UsersPage() {
  const { t, locale } = useTranslation();
  const {
    users,
    loading,
    error,
    searchTerm,
    selectedUser,
    userOrders,
    fetchUsers,
    setSearchTerm,
    setSelectedUser,
    fetchUserOrders,
  } = useUsersStore();

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearchTerm(value);
      setSearchTerm(value);
    },
    [setSearchTerm]
  );

  const handleViewUser = useCallback(
    async (userId: string) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setSelectedUser(user);
        await fetchUserOrders(userId);
      }
    },
    [users, setSelectedUser, fetchUserOrders]
  );

  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Column definitions for DataTable
  const columns = useMemo(
    () => [
      {
        id: 'email',
        header: t('users.table.email'),
        sortable: true,
        cell: (user: any) => user.email,
      },
      {
        id: 'created_at',
        header: t('users.table.joinDate'),
        sortable: true,
        cell: (user: any) => new Date(user.created_at).toLocaleDateString(),
      },
      {
        id: 'updated_at',
        header: t('users.table.lastActive'),
        sortable: true,
        cell: (user: any) => new Date(user.updated_at).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: t('users.table.actions'),
        sortable: false,
        cell: (user: any) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUser(user.id)}
            aria-label={t('users.actions.viewDetails')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [t, handleViewUser, locale]
  );

  // Controls section
  const controlsSection = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
      >
        <SearchBar
          searchValue={localSearchTerm}
          onSearchChange={handleSearch}
          placeholder={t('users.search.placeholder')}
          className="w-full lg:w-96"
        />

        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          {t('common.refresh')}
        </Button>
      </motion.div>
    ),
    [localSearchTerm, loading, handleSearch, handleRefresh, t, locale]
  );

  // Table section
  const tableSection = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          error={error}
          emptyStateTitle={t('users.empty.title')}
          emptyStateDescription={t('users.empty.description')}
          emptyStateIcon={UsersIcon}
          getItemId={(user) => String(user.id)}
        />
      </motion.div>
    ),
    [users, columns, loading, error, t, locale]
  );

  // User details modal
  const modals = useMemo(
    () => (
      <>
        {selectedUser && (
          <Dialog
            open={!!selectedUser}
            onOpenChange={() => setSelectedUser(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('users.details.title')}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* User Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('users.details.userInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          {t('users.details.email')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedUser.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {t('users.details.joinDate')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            selectedUser.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {t('users.details.lastActive')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            selectedUser.updated_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {t('users.details.status')}
                        </p>
                        <Badge variant="outline" className="text-green-600">
                          {t('users.status.active')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('users.details.orderHistory')}</CardTitle>
                    <CardDescription>
                      {t('users.details.totalOrders', {
                        count: userOrders.length,
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userOrders.length > 0 ? (
                      <div className="space-y-3">
                        {userOrders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="flex justify-between items-center p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">#{order.id}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(
                                  order.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {order.total_amount.toLocaleString()}원
                              </p>
                              <Badge variant="outline">
                                {t(`orders.status.${order.status}`)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {userOrders.length > 5 && (
                          <p className="text-sm text-gray-500 text-center">
                            {t('users.details.andMore', {
                              count: userOrders.length - 5,
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {t('users.details.noOrders')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    ),
    [selectedUser, userOrders, setSelectedUser, t, locale]
  );

  return (
    <UsersTemplate
      title={t('users.managementTitle')}
      description={t('users.managementDescription')}
      controlsSection={controlsSection}
      tableSection={tableSection}
      modals={modals}
      loading={loading}
    />
  );
}
