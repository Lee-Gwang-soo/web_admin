'use client';

import { DateCell, ActionButtonCell } from '@/components/atoms/cells';
import { SearchBar } from '@/components/molecules/SearchBar';
import { ColumnDef, DataTable } from '@/components/organisms/DataTable';
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
import { useUserOrders, useUsers } from '@/hooks/useUsersQueries';
import { Order } from '@/lib/supabase';
import { useTranslation } from '@/store/i18n-store';
import { useUsersStore } from '@/store/users-store';
import { motion } from 'framer-motion';
import { Eye, RefreshCw, Users as UsersIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function UsersPage() {
  const { t } = useTranslation();

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = `${t('users.title')} - Admin Dashboard`;
  }, [t]);

  // UI 상태 (Zustand)
  const { searchTerm, selectedUser, setSearchTerm, setSelectedUser } =
    useUsersStore();

  // 서버 데이터 (React Query)
  const { data: users = [], isLoading, error, refetch } = useUsers(searchTerm);

  // selectedUser가 있을 때만 해당 유저의 주문 조회
  const { data: userOrders = [] } = useUserOrders(selectedUser?.id || '', {
    enabled: !!selectedUser?.id,
  });

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Handlers
  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearchTerm(value);
      setSearchTerm(value);
    },
    [setSearchTerm]
  );

  const handleViewUser = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setSelectedUser(user);
      }
    },
    [users, setSelectedUser]
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Column definitions (memoized to prevent unnecessary re-renders)
  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'user_id',
        header: t('users.table.userId'),
        sortable: true,
        cell: (user) => user.user_id || '-',
      },
      {
        id: 'name',
        header: t('users.table.name'),
        sortable: true,
        cell: (user) => user.name || '-',
      },
      {
        id: 'email',
        header: t('users.table.email'),
        sortable: true,
        cell: (user) => user.email,
      },
      {
        id: 'phone',
        header: t('users.table.phone'),
        sortable: true,
        cell: (user) => user.phone || '-',
      },
      {
        id: 'created_at',
        header: t('users.table.joinDate'),
        sortable: true,
        cell: (user) => <DateCell date={user.created_at} />,
      },
      {
        id: 'actions',
        header: t('users.table.actions'),
        sortable: false,
        cell: (user) => (
          <ActionButtonCell
            icon={Eye}
            onClick={() => handleViewUser(user.id)}
            label={t('users.actions.viewDetails')}
          />
        ),
      },
    ],
    [t, handleViewUser]
  );

  return (
    <>
      <UsersTemplate
        title={t('users.managementTitle')}
        description={t('users.managementDescription')}
        controlsSection={
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

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              {t('common.refresh')}
            </Button>
          </motion.div>
        }
        tableSection={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DataTable
              data={users}
              columns={columns}
              loading={isLoading}
              error={error?.message || null}
              emptyStateTitle={t('users.empty.title')}
              emptyStateDescription={t('users.empty.description')}
              emptyStateIcon={UsersIcon}
              getItemId={(user) => String(user.id)}
            />
          </motion.div>
        }
        modals={null}
        loading={isLoading}
      />
      {selectedUser && (
        <Dialog open={true} onOpenChange={() => setSelectedUser(null)}>
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
                        {t('users.details.userId')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedUser.user_id || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t('users.details.name')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedUser.name || '-'}
                      </p>
                    </div>
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
                        {t('users.details.phone')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedUser.phone || '-'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium">
                        {t('users.details.address')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedUser.address || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t('users.details.joinDate')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <DateCell date={selectedUser.created_at} />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t('users.details.lastActive')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <DateCell date={selectedUser.updated_at} />
                      </p>
                    </div>
                    <div className="col-span-2">
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
                      count: userOrders.length.toString(),
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userOrders.length > 0 ? (
                    <div className="space-y-3">
                      {userOrders.slice(0, 5).map((order: Order) => (
                        <div
                          key={order.id}
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">#{order.id}</p>
                            <p className="text-sm text-gray-600">
                              <DateCell date={order.created_at} />
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
                            count: (userOrders.length - 5).toString(),
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
  );
}
