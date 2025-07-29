'use client';

import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable } from '@/components/organisms/DataTable';
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
import { OrderWithItems } from '@/lib/supabase';
import { useTranslation } from '@/store/i18n-store';
import { OrderSortField, useOrdersStore } from '@/store/orders-store';
import { motion } from 'framer-motion';
import { Eye, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Order status badge configuration - 메모이제이션을 위해 함수 외부로 이동
const STATUS_CONFIG: Record<string, { variant: any; color: string }> = {
  pending: { variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
  payment_confirmed: {
    variant: 'default',
    color: 'bg-blue-100 text-blue-800',
  },
  preparing: { variant: 'default', color: 'bg-purple-100 text-purple-800' },
  shipped: { variant: 'default', color: 'bg-green-100 text-green-800' },
  delivered: { variant: 'default', color: 'bg-gray-100 text-gray-800' },
  cancelled: { variant: 'destructive', color: 'bg-red-100 text-red-800' },
  returned: { variant: 'outline', color: 'bg-gray-100 text-gray-600' },
};

const getStatusBadge = (status: string, t: (key: string) => string) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge className={`${config.color} border-0`}>
      {t(`orders.status.${status}`)}
    </Badge>
  );
};

// Optimized Cell Components with stable references
interface OrderIdCellProps {
  order: OrderWithItems;
}

const OrderIdCell = memo<OrderIdCellProps>(function OrderIdCell({ order }) {
  return <span>#{order.id}</span>;
});

interface CustomerCellProps {
  order: OrderWithItems;
  t: (key: string) => string;
}

const CustomerCell = memo<CustomerCellProps>(function CustomerCell({
  order,
  t,
}) {
  return (
    <span>
      {order.customer_email || order.user?.email || t('orders.table.unknown')}
    </span>
  );
});

interface StatusCellProps {
  order: OrderWithItems;
  t: (key: string) => string;
}

const StatusCell = memo<StatusCellProps>(function StatusCell({ order, t }) {
  return getStatusBadge(order.status, t);
});

interface AmountCellProps {
  order: OrderWithItems;
}

const AmountCell = memo<AmountCellProps>(function AmountCell({ order }) {
  return <span>{order.total_amount.toLocaleString()}원</span>;
});

interface DateCellProps {
  order: OrderWithItems;
}

const DateCell = memo<DateCellProps>(function DateCell({ order }) {
  return <span>{new Date(order.created_at).toLocaleDateString()}</span>;
});

// ActionButton 컴포넌트 - stable reference 사용
interface ActionButtonProps {
  order: OrderWithItems;
  onSelect: (order: OrderWithItems) => void;
  label: string;
}

const ActionButton = memo<ActionButtonProps>(function ActionButton({
  order,
  onSelect,
  label,
}) {
  const handleClick = useCallback(() => {
    onSelect(order);
  }, [order, onSelect]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="h-8 w-8 p-0"
      aria-label={label}
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
});

// Order Details Modal Component
interface OrderDetailsModalProps {
  order: OrderWithItems;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}

const OrderDetailsModal = memo<OrderDetailsModalProps>(
  function OrderDetailsModal({ order, onClose, onStatusUpdate }) {
    const { t } = useTranslation();
    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = useCallback(
      async (newStatus: string) => {
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
      },
      [order.id, onStatusUpdate, onClose, t]
    );

    const totalItems = useMemo(
      () =>
        order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      [order.order_items]
    );

    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('orders.details.title')} #{order.id}
          </DialogTitle>
          <DialogDescription>
            {t('orders.details.description')}
          </DialogDescription>
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
                    {new Date(order.created_at).toLocaleDateString()}
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
                {t('orders.details.totalItems', {
                  count: totalItems.toString(),
                })}
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
                        {item.product?.name ||
                          t('orders.details.unknownProduct')}
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
);

// 메인 컴포넌트
const OrdersPage = memo(function OrdersPage() {
  const { t } = useTranslation();

  // 각 상태를 개별적으로 구독 (완전한 리렌더링 방지)
  const selectedOrders = useOrdersStore((state) => state.selectedOrders);
  const toggleOrderSelection = useOrdersStore(
    (state) => state.toggleOrderSelection
  );
  const selectAllOrders = useOrdersStore((state) => state.selectAllOrders);
  const clearSelection = useOrdersStore((state) => state.clearSelection);
  const clearAllFilters = useOrdersStore((state) => state.clearAllFilters);

  // 데이터 관련 상태들
  const orders = useOrdersStore((state) => state.orders);
  const statuses = useOrdersStore((state) => state.statuses);
  const loading = useOrdersStore((state) => state.loading);
  const error = useOrdersStore((state) => state.error);
  const searchTerm = useOrdersStore((state) => state.searchTerm);
  const selectedStatus = useOrdersStore((state) => state.selectedStatus);
  const sortField = useOrdersStore((state) => state.sortField);
  const sortOrder = useOrdersStore((state) => state.sortOrder);

  // Pagination 상태들
  const currentPage = useOrdersStore((state) => state.currentPage);
  const itemsPerPage = useOrdersStore((state) => state.itemsPerPage);
  const totalItems = useOrdersStore((state) => state.totalItems);

  // 액션 함수들
  const setSearchTerm = useOrdersStore((state) => state.setSearchTerm);
  const setSelectedStatus = useOrdersStore((state) => state.setSelectedStatus);
  const setSorting = useOrdersStore((state) => state.setSorting);
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);
  const exportOrdersToExcel = useOrdersStore(
    (state) => state.exportOrdersToExcel
  );
  const refreshData = useOrdersStore((state) => state.refreshData);
  const setCurrentPage = useOrdersStore((state) => state.setCurrentPage);
  const setItemsPerPage = useOrdersStore((state) => state.setItemsPerPage);

  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null
  );

  // Stable references using refs
  const handleSelectOrderRef = useRef<(order: OrderWithItems) => void>(
    () => {}
  );
  const tRef = useRef(t);

  tRef.current = t;

  // Stable handlers that don't change reference
  const stableHandleSelectOrder = useCallback((order: OrderWithItems) => {
    setSelectedOrder(order);
  }, []);

  handleSelectOrderRef.current = stableHandleSelectOrder;

  useEffect(() => {
    refreshData();

    // Cleanup function to clear all filters and selection when leaving the page
    return () => {
      clearAllFilters(); // This clears both filters and selection
    };
  }, [refreshData, clearAllFilters]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleStatusUpdate = useCallback(
    async (orderId: string, status: string) => {
      await updateOrderStatus(orderId, status);
    },
    [updateOrderStatus]
  );

  // Static column definitions with stable cell renderers
  const columns = useMemo(
    () => [
      {
        id: 'id',
        header: t('orders.table.orderNumber'),
        sortable: true,
        cell: (order: OrderWithItems) => <OrderIdCell order={order} />,
      },
      {
        id: 'customer',
        header: t('orders.table.customer'),
        sortable: false,
        cell: (order: OrderWithItems) => (
          <CustomerCell order={order} t={tRef.current} />
        ),
      },
      {
        id: 'status',
        header: t('orders.table.status'),
        sortable: true,
        cell: (order: OrderWithItems) => (
          <StatusCell order={order} t={tRef.current} />
        ),
      },
      {
        id: 'total_amount',
        header: t('orders.table.amount'),
        sortable: true,
        cell: (order: OrderWithItems) => <AmountCell order={order} />,
      },
      {
        id: 'created_at',
        header: t('orders.table.orderDate'),
        sortable: true,
        cell: (order: OrderWithItems) => <DateCell order={order} />,
      },
      {
        id: 'actions',
        header: t('orders.table.actions'),
        sortable: false,
        cell: (order: OrderWithItems) => (
          <ActionButton
            order={order}
            onSelect={handleSelectOrderRef.current!}
            label={t('orders.actions.viewDetails')}
          />
        ),
      },
    ],
    [t] // Only depend on t, not on handlers
  );

  // Controls section - 완전히 독립적인 메모이제이션
  const controlsSection = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
      >
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 max-w-md">
            <SearchBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder={t('orders.search.placeholder')}
              debounceMs={1500} // 1.5초 debounce
              className="w-full"
            />
          </div>

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
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            {t('common.refresh')}
          </Button>

          <Button
            variant="outline"
            onClick={exportOrdersToExcel}
            disabled={loading}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t('orders.actions.exportExcel')}
          </Button>
        </div>
      </motion.div>
    ),
    [
      searchTerm,
      selectedStatus,
      statuses,
      loading,
      refreshData,
      exportOrdersToExcel,
      setSearchTerm,
      setSelectedStatus,
      t,
    ]
  );

  // Table section - 독립적인 메모이제이션
  const tableSection = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          error={error}
          emptyStateTitle={t('orders.empty.title')}
          emptyStateDescription={t('orders.empty.description')}
          emptyStateIcon={Eye}
          sortConfig={{
            field: sortField,
            order: sortOrder === 'none' ? null : sortOrder,
          }}
          onSort={(field) => setSorting(field as OrderSortField)}
          selectedItems={selectedOrders}
          onItemSelect={toggleOrderSelection}
          onSelectAll={selectAllOrders}
          getItemId={(order) => String(order.id)}
          showPagination={true}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </motion.div>
    ),
    [
      orders,
      columns,
      loading,
      error,
      sortField,
      sortOrder,
      selectedOrders,
      toggleOrderSelection,
      selectAllOrders,
      setSorting,
      t,
      currentPage,
      itemsPerPage,
      totalItems,
      setCurrentPage,
      setItemsPerPage,
    ]
  );

  // Summary section
  const summarySection = useMemo(
    () => <OrdersSummarySection orders={orders} loading={loading} />,
    [orders, loading]
  );

  // Modal 렌더링을 조건부로 최적화
  const modal = useMemo(() => {
    if (!selectedOrder) return null;

    return (
      <Dialog open={true} onOpenChange={handleCloseModal}>
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      </Dialog>
    );
  }, [selectedOrder, handleCloseModal, handleStatusUpdate]);

  return (
    <>
      <OrdersTemplate
        title={t('orders.managementTitle')}
        description={t('orders.managementDescription')}
        summarySection={summarySection}
        controlsSection={controlsSection}
        tableSection={tableSection}
        modals={null} // modals를 별도로 렌더링
        loading={loading}
      />
      {modal}
    </>
  );
});

export default OrdersPage;
