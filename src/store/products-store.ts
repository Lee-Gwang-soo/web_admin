import { create } from 'zustand';
import { supabaseApi, Product } from '@/lib/supabase';

export type SortField =
  | 'name'
  | 'category'
  | 'price'
  | 'stock'
  | 'status'
  | 'created_at';
export type SortOrder = 'asc' | 'desc' | 'none';

export interface ProductsState {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  sortField: SortField | null;
  sortOrder: SortOrder;
  editingProduct: Product | null;
  selectedProducts: string[];
  bulkEditData: Partial<Pick<Product, 'category' | 'price' | 'stock'>> | null;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSorting: (field: SortField) => void;
  setEditingProduct: (product: Product | null) => void;
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  // Bulk operations
  toggleProductSelection: (productId: string) => void;
  selectAllProducts: () => void;
  clearSelection: () => void;
  bulkDeleteProducts: (productIds: string[]) => Promise<void>;
  bulkUpdateProducts: (
    productIds: string[],
    updates: Partial<Pick<Product, 'category' | 'price' | 'stock'>>
  ) => Promise<void>;
  setBulkEditData: (
    data: Partial<Pick<Product, 'category' | 'price' | 'stock'>> | null
  ) => void;
  // Clone operation
  cloneProduct: (product: Product) => Promise<void>;
  // Export operations
  exportProductsToExcel: () => void;
  refreshData: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'all',
  sortField: null,
  sortOrder: 'none',
  editingProduct: null,
  selectedProducts: [],
  bulkEditData: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });

      const { searchTerm, selectedCategory } = get();
      const products = await supabaseApi.getProducts(
        searchTerm || undefined,
        selectedCategory !== 'all' ? selectedCategory : undefined
      );

      set({ products, loading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch products',
        loading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await supabaseApi.getProductCategories();
      set({ categories: ['all', ...categories] });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ categories: ['all'] });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    // Debounce search - fetch after a delay
    setTimeout(() => {
      if (get().searchTerm === term) {
        get().fetchProducts();
      }
    }, 300);
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
    get().fetchProducts();
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

    // Apply sorting
    const { products } = get();
    const { sortField: newSortField, sortOrder: newSortOrder } = get();

    if (newSortField && newSortOrder !== 'none') {
      const getStatusValue = (stock: number) => {
        if (stock === 0) return 0; // 품절
        if (stock < 10) return 1; // 재고 부족
        return 2; // 재고 충분
      };

      const sortedProducts = [...products].sort((a, b) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;

        if (newSortField === 'status') {
          // 상태별 정렬 - 재고량에 따라 상태 값 계산
          aValue = getStatusValue(a.stock || 0);
          bValue = getStatusValue(b.stock || 0);
        } else {
          aValue = a[newSortField] as string | number | Date;
          bValue = b[newSortField] as string | number | Date;
        }

        if (newSortField === 'price' || newSortField === 'stock') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else if (newSortField === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (newSortField !== 'status') {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (aValue < bValue) return newSortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return newSortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      set({ products: sortedProducts });
    } else {
      // Reset to original order
      get().fetchProducts();
    }
  },

  setEditingProduct: (product: Product | null) => {
    set({ editingProduct: product });
  },

  updateProduct: async (product: Product) => {
    try {
      // Call Supabase API to update the product
      const updatedProduct = await supabaseApi.updateProduct(product);

      // Update local state with the returned data
      const { products } = get();
      const updatedProducts = products.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      );

      set({ products: updatedProducts, editingProduct: null });

      console.log('✅ Product updated successfully:', updatedProduct);
    } catch (error) {
      console.error('❌ Error updating product:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update product',
      });
      throw error;
    }
  },

  addProduct: async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      // Call Supabase API to add the product
      const newProduct = await supabaseApi.addProduct(productData);

      // Add the new product to local state
      const { products } = get();
      set({ products: [newProduct, ...products] });

      // Refresh categories in case a new category was added
      get().fetchCategories();

      console.log('✅ Product added successfully:', newProduct);
    } catch (error) {
      console.error('❌ Error adding product:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to add product',
      });
      throw error;
    }
  },

  deleteProduct: async (productId: string) => {
    try {
      // Find the product to get image URL
      const { products } = get();
      const productToDelete = products.find((p) => p.id === productId);

      // Delete the product from database
      await supabaseApi.deleteProduct(productId);

      // Delete associated image if exists
      if (productToDelete?.image_url) {
        await supabaseApi.deleteProductImage(productToDelete.image_url);
      }

      // Remove the product from local state
      const updatedProducts = products.filter((p) => p.id !== productId);
      set({ products: updatedProducts });

      console.log('✅ Product deleted successfully:', productId);
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete product',
      });
      throw error;
    }
  },

  refreshData: async () => {
    await Promise.all([get().fetchProducts(), get().fetchCategories()]);
  },

  // Bulk operations
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

  selectAllProducts: () => {
    const { products } = get();
    set({ selectedProducts: products.map((p) => p.id) });
  },

  clearSelection: () => {
    set({ selectedProducts: [] });
  },

  bulkDeleteProducts: async (productIds: string[]) => {
    try {
      set({ loading: true, error: null });

      // Get products to delete for image cleanup
      const { products } = get();
      const productsToDelete = products.filter((p) =>
        productIds.includes(p.id)
      );

      // Delete products and their images
      await Promise.all(
        productsToDelete.map(async (product) => {
          await supabaseApi.deleteProduct(product.id);
          if (product.image_url) {
            await supabaseApi.deleteProductImage(product.image_url);
          }
        })
      );

      // Update local state
      const updatedProducts = products.filter(
        (p) => !productIds.includes(p.id)
      );
      set({ products: updatedProducts, selectedProducts: [], loading: false });

      console.log('✅ Bulk delete completed successfully');
    } catch (error) {
      console.error('❌ Error during bulk delete:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete products',
        loading: false,
      });
      throw error;
    }
  },

  bulkUpdateProducts: async (
    productIds: string[],
    updates: Partial<Pick<Product, 'category' | 'price' | 'stock'>>
  ) => {
    try {
      set({ loading: true, error: null });

      const { products } = get();
      const productsToUpdate = products.filter((p) =>
        productIds.includes(p.id)
      );

      // Update each product
      const updatedProducts = await Promise.all(
        productsToUpdate.map(async (product) => {
          const updatedProduct = { ...product, ...updates };
          return await supabaseApi.updateProduct(updatedProduct);
        })
      );

      // Update local state
      const allProducts = products.map((p) => {
        const updated = updatedProducts.find((up) => up.id === p.id);
        return updated || p;
      });

      set({
        products: allProducts,
        selectedProducts: [],
        bulkEditData: null,
        loading: false,
      });

      console.log('✅ Bulk update completed successfully');
    } catch (error) {
      console.error('❌ Error during bulk update:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update products',
        loading: false,
      });
      throw error;
    }
  },

  setBulkEditData: (
    data: Partial<Pick<Product, 'category' | 'price' | 'stock'>> | null
  ) => {
    set({ bulkEditData: data });
  },

  // Clone operation
  cloneProduct: async (product: Product) => {
    try {
      const clonedData = {
        name: `${product.name} (복사본)`,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url, // Keep the same image
      };

      await get().addProduct(clonedData);
      console.log('✅ Product cloned successfully');
    } catch (error) {
      console.error('❌ Error cloning product:', error);
      throw error;
    }
  },

  // Export operations
  exportProductsToExcel: () => {
    const { products } = get();

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
            product.image_url || '',
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
}));
