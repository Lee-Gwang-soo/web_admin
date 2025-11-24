import { OrderWithItems } from '@/lib/supabase';
import { create } from 'zustand';

export type OrderSortField =
  | 'created_at'
  | 'total_amount'
  | 'customer_email'
  | 'status';
export type SortOrder = 'asc' | 'desc' | 'none';

/**
 * 주문 페이지 UI 상태 관리 스토어
 * - React Query를 사용하므로 서버 데이터는 저장하지 않음
 * - UI 상태만 관리: 검색, 필터, 정렬, 페이지네이션, 선택
 */
interface OrdersState {
  // 필터 및 검색
  searchTerm: string;
  selectedStatus: string;
  sortField: OrderSortField;
  sortOrder: SortOrder;

  // UI 상태
  selectedOrders: string[];
  selectedOrderForDetails: OrderWithItems | null;
  bulkStatusUpdate: string | null;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedStatus: (status: string) => void;
  setSorting: (field: OrderSortField) => void;
  toggleOrderSelection: (orderId: string) => void;
  toggleAllOrdersSelection: (orderIds: string[]) => void;
  selectAllOrders: (orderIds: string[]) => void;
  clearSelection: () => void;
  clearAllFilters: () => void;
  exportToExcel: (orders: OrderWithItems[]) => void;
  exportOrdersToExcel: (orders: OrderWithItems[]) => void;
  setBulkStatusUpdate: (status: string | null) => void;
  setSelectedOrderForDetails: (order: OrderWithItems | null) => void;

  // Pagination actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  nextPage: (totalItems: number) => void;
  prevPage: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  // 필터 및 검색
  searchTerm: '',
  selectedStatus: 'all',
  sortField: 'created_at',
  sortOrder: 'desc',

  // UI 상태
  selectedOrders: [],
  selectedOrderForDetails: null,
  bulkStatusUpdate: null,

  // Pagination
  currentPage: 1,
  itemsPerPage: 10,

  setSearchTerm: (term: string) => {
    set({ searchTerm: term, currentPage: 1 });
  },

  setSelectedStatus: (status: string) => {
    set({ selectedStatus: status, currentPage: 1 });
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
  },

  // Selection
  toggleOrderSelection: (orderId: string) => {
    const { selectedOrders } = get();
    const isSelected = selectedOrders.includes(orderId);

    if (isSelected) {
      set({ selectedOrders: selectedOrders.filter((id) => id !== orderId) });
    } else {
      set({ selectedOrders: [...selectedOrders, orderId] });
    }
  },

  toggleAllOrdersSelection: (orderIds: string[]) => {
    const { selectedOrders } = get();

    if (selectedOrders.length === orderIds.length) {
      set({ selectedOrders: [] });
    } else {
      set({ selectedOrders: orderIds });
    }
  },

  selectAllOrders: (orderIds: string[]) => {
    const { selectedOrders } = get();

    // Toggle logic: if all are selected, clear selection; otherwise select all
    if (selectedOrders.length === orderIds.length && orderIds.length > 0) {
      set({ selectedOrders: [] });
    } else {
      set({ selectedOrders: orderIds });
    }
  },

  clearSelection: () => {
    set({ selectedOrders: [] });
  },

  clearAllFilters: () => {
    set({
      searchTerm: '',
      selectedStatus: 'all',
      sortField: 'created_at',
      sortOrder: 'desc',
      currentPage: 1,
      selectedOrders: [],
    });
  },

  setBulkStatusUpdate: (status: string | null) => {
    set({ bulkStatusUpdate: status });
  },

  setSelectedOrderForDetails: (order: OrderWithItems | null) => {
    set({ selectedOrderForDetails: order });
  },

  exportToExcel: (orders: OrderWithItems[]) => {
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

  exportOrdersToExcel: (orders: OrderWithItems[]) => {
    return get().exportToExcel(orders);
  },

  // Pagination actions
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setItemsPerPage: (itemsPerPage: number) => {
    set({ itemsPerPage: itemsPerPage, currentPage: 1 });
  },

  nextPage: (totalItems: number) => {
    const { currentPage, itemsPerPage } = get();
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },

  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },
}));
