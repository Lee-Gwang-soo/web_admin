import { Product } from '@/lib/supabase';
import { create } from 'zustand';

export type SortField =
  | 'name'
  | 'price'
  | 'stock'
  | 'category'
  | 'updated_at'
  | 'created_at'
  | 'status';
export type SortOrder = 'asc' | 'desc' | 'none';

/**
 * 상품 페이지 UI 상태 관리 스토어
 * - React Query를 사용하므로 서버 데이터는 저장하지 않음
 * - UI 상태만 관리: 검색, 필터, 정렬, 페이지네이션, 선택
 */
interface ProductsState {
  // 필터 및 검색
  searchTerm: string;
  selectedCategory: string;
  sortField: SortField | null;
  sortOrder: SortOrder;

  // UI 상태
  editingProduct: Product | null;
  selectedProducts: string[];
  bulkEditData: Partial<Pick<Product, 'category' | 'price' | 'stock'>> | null;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSorting: (field: SortField) => void;
  setEditingProduct: (product: Product | null) => void;
  setBulkEditData: (
    data: Partial<Pick<Product, 'category' | 'price' | 'stock'>> | null
  ) => void;

  // Selection
  toggleProductSelection: (id: string) => void;
  selectAllProducts: (productIds: string[]) => void;
  clearSelection: () => void;
  clearAllFilters: () => void;

  // Export
  exportProductsToExcel: (products: Product[]) => void;

  // Pagination actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  nextPage: (totalItems: number) => void;
  prevPage: () => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  // 필터 및 검색
  searchTerm: '',
  selectedCategory: 'all',
  sortField: null,
  sortOrder: 'none',

  // UI 상태
  editingProduct: null,
  selectedProducts: [],
  bulkEditData: null,

  // Pagination
  currentPage: 1,
  itemsPerPage: 10,

  setSearchTerm: (term: string) => {
    set({ searchTerm: term, currentPage: 1 }); // 검색 시 첫 페이지로
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category, currentPage: 1 }); // 필터 변경 시 첫 페이지로
  },

  setSorting: (field: SortField) => {
    const { sortField, sortOrder } = get();

    if (sortField === field) {
      // Same field - cycle through: asc -> desc -> none
      if (sortOrder === 'none') {
        set({ sortOrder: 'asc' });
      } else if (sortOrder === 'asc') {
        set({ sortOrder: 'desc' });
      } else {
        set({ sortField: null, sortOrder: 'none' });
      }
    } else {
      // Different field - start with asc
      set({ sortField: field, sortOrder: 'asc' });
    }
  },

  setEditingProduct: (product: Product | null) => {
    set({ editingProduct: product });
  },

  setBulkEditData: (
    data: Partial<Pick<Product, 'category' | 'price' | 'stock'>> | null
  ) => {
    set({ bulkEditData: data });
  },

  // Selection
  toggleProductSelection: (productId: string) => {
    const { selectedProducts } = get();
    if (selectedProducts.includes(productId)) {
      set({
        selectedProducts: selectedProducts.filter((id) => id !== productId),
      });
    } else {
      set({ selectedProducts: [...selectedProducts, productId] });
    }
  },

  selectAllProducts: (productIds: string[]) => {
    const { selectedProducts } = get();

    // Toggle logic: if all are selected, clear selection; otherwise select all
    if (
      selectedProducts.length === productIds.length &&
      productIds.length > 0
    ) {
      set({ selectedProducts: [] });
    } else {
      set({ selectedProducts: productIds });
    }
  },

  clearSelection: () => {
    set({ selectedProducts: [] });
  },

  clearAllFilters: () => {
    set({
      searchTerm: '',
      selectedCategory: 'all',
      sortField: null,
      sortOrder: 'none',
      currentPage: 1,
      selectedProducts: [],
    });
  },

  // Export operations
  exportProductsToExcel: (products: Product[]) => {
    // Dynamically import XLSX to avoid SSR issues
    import('xlsx')
      .then((XLSX) => {
        // Create worksheet data
        const worksheetData = [
          // Header row
          ['ID', '제품명', '카테고리', '가격', '재고', '등록일', '이미지URL'],
          // Data rows
          ...products.map((product) => [
            product.id,
            product.name,
            product.category,
            product.price,
            product.stock || 0,
            new Date(product.created_at).toLocaleString('ko-KR'),
            product.images?.[0] || product.image_url || '',
          ]),
        ];

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        const colWidths = [
          { wch: 25 }, // ID
          { wch: 30 }, // 제품명
          { wch: 15 }, // 카테고리
          { wch: 12 }, // 가격
          { wch: 10 }, // 재고
          { wch: 20 }, // 등록일
          { wch: 50 }, // 이미지URL
        ];
        worksheet['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, '제품목록');

        // Generate Excel file and download
        const fileName = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        console.log('✅ Excel export completed');
      })
      .catch((error) => {
        console.error('❌ Error importing XLSX library:', error);
        alert('Excel 내보내기 중 오류가 발생했습니다.');
      });
  },

  // Pagination actions
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setItemsPerPage: (itemsPerPage: number) => {
    set({ itemsPerPage: itemsPerPage, currentPage: 1 }); // 페이지를 1로 리셋
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
