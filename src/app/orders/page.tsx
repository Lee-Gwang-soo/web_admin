'use client';

import {
  DateCell,
  PriceCell,
  ActionButtonCell,
} from '@/components/atoms/cells';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, ColumnDef } from '@/components/organisms/DataTable';
import { OrdersSummarySection } from '@/components/organisms/orders/OrdersSummarySection';
import { OrdersTemplate } from '@/components/templates/OrdersTemplate';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTableState } from '@/hooks/useTableState';
import {
  useOrderStatuses,
  useOrders,
  useUpdateOrderStatus,
} from '@/hooks/useOrdersQueries';
import { OrderWithItems } from '@/lib/supabase';
import { useTranslation } from '@/store/i18n-store';
import { useOrdersStore } from '@/store/orders-store';
import { motion } from 'framer-motion';
import { Eye, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Order status badge configuration
const STATUS_CONFIG: Record<string, { color: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800' },
  payment_confirmed: { color: 'bg-blue-100 text-blue-800' },
  preparing: { color: 'bg-purple-100 text-purple-800' },
  shipped: { color: 'bg-green-100 text-green-800' },
  delivered: { color: 'bg-gray-100 text-gray-800' },
  cancelled: { color: 'bg-red-100 text-red-800' },
  returned: { color: 'bg-gray-100 text-gray-600' },
};

const getStatusBadge = (status: string, t: (key: string) => string) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge className={`${config.color} border-0`}>
      {t(`orders.status.${status}`)}
    </Badge>
  );
};

// Order Details Modal Component
function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
  t,
}: {
  order: OrderWithItems;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
  t: (key: string, params?: any) => string;
}) {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(t('messages.updateError'));
    } finally {
      setUpdating(false);
    }
  };

  const totalItems =
    order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {t('orders.details.title')} #{order.id}
        </DialogTitle>
        <DialogDescription>{t('orders.details.description')}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('orders.details.orderInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">
                  {t('orders.details.orderNumber')}
                </p>
                <p className="text-sm text-gray-600">#{order.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {t('orders.details.status')}
                </p>
                {getStatusBadge(order.status, t)}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {t('orders.details.orderDate')}
                </p>
                <p className="text-sm text-gray-600">
                  <DateCell date={order.created_at} />
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {t('orders.details.customerEmail')}
                </p>
                <p className="text-sm text-gray-600">
                  {order.customer_email || order.user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>{t('orders.details.orderItems')}</CardTitle>
            <CardDescription>
              {t('orders.details.totalItems', { count: totalItems.toString() })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {item.product?.name || t('orders.details.unknownProduct')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('orders.details.quantity')}: {item.quantity} |{' '}
                      {t('orders.details.unitPrice')}:{' '}
                      {(item.price || 0).toLocaleString()}원
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {(
                        (item.quantity || 0) * (item.price || 0)
                      ).toLocaleString()}
                      원
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {t('orders.details.totalItems', {
                      count: totalItems.toString(),
                    })}
                  </span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {t('orders.details.total')}{' '}
                  {(order.total_amount || 0).toLocaleString()}원
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Update */}
        <Card>
          <CardHeader>
            <CardTitle>{t('orders.details.updateStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select onValueChange={handleStatusUpdate} disabled={updating}>
                <SelectTrigger className="w-48">
                  <SelectValue
                    placeholder={t('orders.details.selectNewStatus')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    {t('orders.status.pending')}
                  </SelectItem>
                  <SelectItem value="payment_confirmed">
                    {t('orders.status.payment_confirmed')}
                  </SelectItem>
                  <SelectItem value="preparing">
                    {t('orders.status.preparing')}
                  </SelectItem>
                  <SelectItem value="shipped">
                    {t('orders.status.shipped')}
                  </SelectItem>
                  <SelectItem value="delivered">
                    {t('orders.status.delivered')}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t('orders.status.cancelled')}
                  </SelectItem>
                  <SelectItem value="returned">
                    {t('orders.status.returned')}
                  </SelectItem>
                </SelectContent>
              </Select>
              {updating && (
                <div className="text-sm text-gray-500">
                  {t('orders.details.updating')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
}

export default function OrdersPage() {
  const { t } = useTranslation();

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = `${t('orders.title')} - Admin Dashboard`;
  }, [t]);

  // UI 상태 (Zustand)
  const {
    searchTerm,
    selectedStatus,
    sortField,
    sortOrder,
    selectedOrders,
    currentPage,
    itemsPerPage,
    setSearchTerm,
    setSelectedStatus,
    setSorting,
    toggleOrderSelection,
    selectAllOrders,
    clearAllFilters,
    exportOrdersToExcel,
    setCurrentPage,
    setItemsPerPage,
  } = useOrdersStore();

  // 서버 데이터 (React Query)
  const {
    data: allOrders = [],
    isLoading,
    refetch,
  } = useOrders(
    searchTerm,
    selectedStatus !== 'all' ? selectedStatus : undefined
  );
  const { data: rawStatuses = [] } = useOrderStatuses();
  const updateStatusMutation = useUpdateOrderStatus();

  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllFilters();
    };
  }, [clearAllFilters]);

  // 상태 목록 (all 제외)
  const statuses = rawStatuses.filter((s) => s !== 'all');

  // 테이블 상태 관리 (커스텀 훅 사용)
  const { sortedData, totalItems, getCurrentPageIds } = useTableState({
    data: allOrders,
    sortField,
    sortOrder,
    currentPage,
    itemsPerPage,
    selectedItems: selectedOrders,
    getItemId: (order) => String(order.id),
  });

  // Handlers
  const handleSelectOrder = useCallback((order: OrderWithItems) => {
    setSelectedOrder(order);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleStatusUpdate = useCallback(
    async (orderId: string, status: string) => {
      await updateStatusMutation.mutateAsync({ orderId, status });
    },
    [updateStatusMutation]
  );

  const handleSelectAll = useCallback(() => {
    const currentPageIds = getCurrentPageIds();
    selectAllOrders(currentPageIds);
  }, [getCurrentPageIds, selectAllOrders]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleExport = useCallback(() => {
    exportOrdersToExcel(allOrders);
  }, [exportOrdersToExcel, allOrders]);

  // Column definitions (memoized to prevent unnecessary re-renders)
  const columns: ColumnDef<OrderWithItems>[] = useMemo(
    () => [
      {
        id: 'id',
        header: t('orders.table.orderNumber'),
        sortable: true,
        cell: (order) => <span>#{order.id}</span>,
      },
      {
        id: 'customer',
        header: t('orders.table.customer'),
        sortable: false,
        cell: (order) => (
          <span>
            {order.customer_email ||
              order.user?.email ||
              t('orders.table.unknown')}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('orders.table.status'),
        sortable: true,
        cell: (order) => getStatusBadge(order.status, t),
      },
      {
        id: 'total_amount',
        header: t('orders.table.amount'),
        sortable: true,
        cell: (order) => <PriceCell amount={order.total_amount} />,
      },
      {
        id: 'created_at',
        header: t('orders.table.orderDate'),
        sortable: true,
        cell: (order) => <DateCell date={order.created_at} />,
      },
      {
        id: 'actions',
        header: t('orders.table.actions'),
        sortable: false,
        cell: (order) => (
          <ActionButtonCell
            icon={Eye}
            onClick={() => handleSelectOrder(order)}
            label={t('orders.actions.viewDetails')}
          />
        ),
      },
    ],
    [t, handleSelectOrder]
  );

  return (
    <>
      <OrdersTemplate
        title={t('orders.managementTitle')}
        description={t('orders.managementDescription')}
        summarySection={
          <OrdersSummarySection orders={allOrders} loading={isLoading} />
        }
        controlsSection={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('orders.filter.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('orders.filter.allStatuses')}
                  </SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`orders.status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 max-w-4xl">
                <SearchBar
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder={t('orders.search.placeholder')}
                  debounceMs={1500}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
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

              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isLoading}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {t('orders.actions.exportExcel')}
              </Button>
            </div>
          </motion.div>
        }
        tableSection={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DataTable
              data={sortedData}
              columns={columns}
              loading={isLoading}
              error={null}
              emptyStateTitle={t('orders.empty.title')}
              emptyStateDescription={t('orders.empty.description')}
              emptyStateIcon={Eye}
              sortConfig={{
                field: sortField,
                order: sortOrder === 'none' ? null : sortOrder,
              }}
              onSort={(field) => setSorting(field as any)}
              selectedItems={selectedOrders}
              onItemSelect={toggleOrderSelection}
              onSelectAll={handleSelectAll}
              getItemId={(order) => String(order.id)}
              showPagination={true}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </motion.div>
        }
        modals={null}
        loading={isLoading}
      />
      {selectedOrder && (
        <Dialog open={true} onOpenChange={handleCloseModal}>
          <OrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseModal}
            onStatusUpdate={handleStatusUpdate}
            t={t}
          />
        </Dialog>
      )}
    </>
  );
}
