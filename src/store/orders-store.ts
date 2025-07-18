import { OrderWithItems, supabaseApi } from '@/lib/supabase';
import { create } from 'zustand';

export type OrderSortField =
  | 'created_at'
  | 'total_amount'
  | 'customer_email'
  | 'status';
export type SortOrder = 'asc' | 'desc' | 'none';

interface OrdersState {
  orders: OrderWithItems[];
  statuses: string[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedStatus: string;
  sortField: OrderSortField;
  sortOrder: SortOrder;
  selectedOrders: string[]; // Changed back to array
  bulkActionLoading: boolean;
  selectedOrderForDetails: OrderWithItems | null;
  bulkStatusUpdate: string | null;

  // Actions
  fetchOrders: () => Promise<void>;
  fetchStatuses: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedStatus: (status: string) => void;
  setSorting: (field: OrderSortField) => void;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  bulkUpdateStatus: (orderIds: string[], status: string) => Promise<void>;
  bulkDeleteOrders: (orderIds: string[]) => Promise<void>;
  toggleOrderSelection: (orderId: string) => void;
  toggleAllOrdersSelection: () => void;
  selectAllOrders: () => void;
  clearSelection: () => void;
  exportToExcel: () => void;
  exportOrdersToExcel: () => void;
  bulkUpdateOrderStatus: (orderIds: string[], status: string) => Promise<void>;
  setBulkStatusUpdate: (status: string | null) => void;
  setSelectedOrderForDetails: (order: OrderWithItems | null) => void;
  refreshData: () => Promise<void>;
}

// Debounce utility
let searchTimeoutId: NodeJS.Timeout | null = null;

// Memoized sorting function
const sortOrders = (
  orders: OrderWithItems[],
  field: OrderSortField,
  order: SortOrder
): OrderWithItems[] => {
  if (order === 'none') return orders;

  return [...orders].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (field) {
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'total_amount':
        aValue = a.total_amount;
        bValue = b.total_amount;
        break;
      case 'customer_email':
        aValue = a.customer_email?.toLowerCase() || '';
        bValue = b.customer_email?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  statuses: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedStatus: 'all',
  sortField: 'created_at',
  sortOrder: 'desc',
  selectedOrders: [], // Changed back to array
  bulkActionLoading: false,
  selectedOrderForDetails: null,
  bulkStatusUpdate: null,

  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });

      const { searchTerm, selectedStatus } = get();

      const orders = await supabaseApi.getOrders(
        searchTerm || undefined,
        selectedStatus !== 'all' ? selectedStatus : undefined
      );

      const { sortField, sortOrder } = get();
      const sortedOrders = sortOrders(orders, sortField, sortOrder);

      set({
        orders: sortedOrders,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch orders',
        loading: false,
      });
    }
  },

  fetchStatuses: async () => {
    try {
      const statuses = await supabaseApi.getOrderStatuses();
      set({ statuses: ['all', ...statuses] });
    } catch (error) {
      console.error('Error fetching statuses:', error);
      set({
        statuses: [
          'all',
          'pending',
          'payment_confirmed',
          'preparing',
          'shipped',
          'delivered',
          'cancelled',
          'returned',
        ],
      });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });

    // Clear existing timeout
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }

    // Set new timeout
    searchTimeoutId = setTimeout(() => {
      const currentTerm = get().searchTerm;
      if (currentTerm === term) {
        get().fetchOrders();
      }
    }, 300);
  },

  setSelectedStatus: (status: string) => {
    set({ selectedStatus: status });
    get().fetchOrders();
  },

  setSorting: (field: OrderSortField) => {
    const currentField = get().sortField;
    const currentOrder = get().sortOrder;

    let newOrder: SortOrder = 'asc';
    if (currentField === field) {
      newOrder =
        currentOrder === 'asc'
          ? 'desc'
          : currentOrder === 'desc'
            ? 'none'
            : 'asc';
    }

    set({ sortField: field, sortOrder: newOrder });

    // Apply sorting to current orders
    const { orders } = get();
    const sortedOrders = sortOrders(orders, field, newOrder);
    set({ orders: sortedOrders });
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      await supabaseApi.updateOrderStatus(orderId, status);

      // Update local state
      const { orders } = get();
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: status as any } : order
      );

      set({ orders: updatedOrders });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Bulk operations
  toggleOrderSelection: (orderId: string) => {
    const { selectedOrders } = get();
    const isSelected = selectedOrders.includes(orderId);

    if (isSelected) {
      set({ selectedOrders: selectedOrders.filter((id) => id !== orderId) });
    } else {
      set({ selectedOrders: [...selectedOrders, orderId] });
    }
  },

  toggleAllOrdersSelection: () => {
    const { orders, selectedOrders } = get();
    const allOrderIds = orders.map((order) => order.id);

    if (selectedOrders.length === allOrderIds.length) {
      set({ selectedOrders: [] });
    } else {
      set({ selectedOrders: allOrderIds });
    }
  },

  selectAllOrders: () => {
    const { orders } = get();
    set({ selectedOrders: orders.map((order) => order.id) });
  },

  clearSelection: () => {
    set({ selectedOrders: [] });
  },

  bulkUpdateStatus: async (orderIds: string[], status: string) => {
    try {
      await supabaseApi.bulkUpdateOrderStatus(orderIds, status);

      // Update local state
      const { orders } = get();
      const updatedOrders = orders.map((order) =>
        orderIds.includes(order.id)
          ? { ...order, status: status as any }
          : order
      );

      set({
        orders: updatedOrders,
        selectedOrders: [],
        bulkStatusUpdate: null,
      });
    } catch (error) {
      console.error('Error bulk updating order status:', error);
      throw error;
    }
  },

  bulkUpdateOrderStatus: async (orderIds: string[], status: string) => {
    return get().bulkUpdateStatus(orderIds, status);
  },

  bulkDeleteOrders: async (orderIds: string[]) => {
    try {
      await supabaseApi.bulkDeleteOrders(orderIds);

      // Update local state
      const { orders } = get();
      const filteredOrders = orders.filter(
        (order) => !orderIds.includes(order.id)
      );

      set({ orders: filteredOrders, selectedOrders: [] });
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      throw error;
    }
  },

  setBulkStatusUpdate: (status: string | null) => {
    set({ bulkStatusUpdate: status });
  },

  setSelectedOrderForDetails: (order: OrderWithItems | null) => {
    set({ selectedOrderForDetails: order });
  },

  exportToExcel: () => {
    const { orders } = get();

    import('xlsx')
      .then((XLSX) => {
        // Prepare data for Excel export
        const exportData = orders.map((order) => ({
          '주문 ID': order.id,
          '고객 이메일': order.user?.email || '알 수 없음',
          '주문 상태': order.status,
          '총 금액': order.total_amount,
          '주문 상품 수': order.order_items?.length || 0,
          '주문 일시': new Date(order.created_at).toLocaleString('ko-KR'),
          '상품 목록':
            order.order_items
              ?.map((item) => `${item.product?.name}(${item.quantity}개)`)
              .join(', ') || '',
        }));

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        worksheet['!cols'] = [
          { wch: 35 }, // 주문 ID
          { wch: 25 }, // 고객 이메일
          { wch: 15 }, // 주문 상태
          { wch: 15 }, // 총 금액
          { wch: 12 }, // 주문 상품 수
          { wch: 20 }, // 주문 일시
          { wch: 50 }, // 상품 목록
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, '주문 목록');

        // Generate filename and download
        const fileName = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        console.log('✅ Orders exported to Excel successfully');
      })
      .catch((error) => {
        console.error('❌ Error exporting orders:', error);
        alert('주문 데이터 내보내기 중 오류가 발생했습니다.');
      });
  },

  exportOrdersToExcel: () => {
    return get().exportToExcel();
  },

  refreshData: async () => {
    await Promise.all([get().fetchOrders(), get().fetchStatuses()]);
  },
}));
