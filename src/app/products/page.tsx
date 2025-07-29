'use client';

import { StatusBadge } from '@/components/atoms';
import { BulkActionBar, KPICard, SearchBar } from '@/components/molecules';
import { ColumnDef, DataTable, ProductFormModal } from '@/components/organisms';
import { ProductsTemplate } from '@/components/templates';
import { Button } from '@/components/ui/button';
// prettier-ignore
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/lib/supabase';
import { useTranslation } from '@/store/i18n-store';
import { SortField, useProductsStore } from '@/store/products-store';
import { motion } from 'framer-motion';
// prettier-ignore
import { Copy, DollarSign, Edit, FileSpreadsheet, Package, Plus, RefreshCw, Trash2, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Optimized Image Component
const OptimizedImage = memo<{
  src: string | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onClick?: () => void;
}>(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  onClick,
}) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    setImageSrc('');
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  if (!imageSrc || hasError) {
    return (
      <div
        className={`${className} bg-gray-200 flex items-center justify-center rounded-md cursor-pointer hover:bg-gray-300 transition-colors`}
        style={{ width, height }}
        onClick={onClick}
        title={hasError ? `Image load failed: ${alt}` : `No image: ${alt}`}
      >
        <Package className="h-6 w-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative" onClick={onClick}>
      {isLoading && (
        <div
          className={`${className} bg-gray-200 animate-pulse flex items-center justify-center absolute inset-0 z-10 rounded-md`}
        >
          <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQACAQIHAQAAAAAAAAAAAAABAgADBAUREiExYVFxkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT4Q6BnFoTg=="
      />
    </div>
  );
});

// Optimized Cell Components with stable references
interface ProductImageCellProps {
  product: Product;
}

const ProductImageCell = memo<ProductImageCellProps>(function ProductImageCell({
  product,
}) {
  return (
    <div className="flex items-center justify-center">
      <OptimizedImage
        src={product.image_url}
        alt={product.name}
        width={40}
        height={40}
        className="rounded object-cover"
      />
    </div>
  );
});

interface ProductNameCellProps {
  product: Product;
}

const ProductNameCell = memo<ProductNameCellProps>(function ProductNameCell({
  product,
}) {
  return (
    <div>
      <div className="font-medium">{product.name}</div>
      <div className="text-sm text-gray-500">{product.category}</div>
    </div>
  );
});

interface ProductPriceCellProps {
  product: Product;
  formatPrice: (price: number) => string;
}

const ProductPriceCell = memo<ProductPriceCellProps>(function ProductPriceCell({
  product,
  formatPrice,
}) {
  return <span className="font-medium">{formatPrice(product.price)}</span>;
});

interface ProductStockCellProps {
  product: Product;
  getStockBadgeVariant: (stock: number) => 'success' | 'warning' | 'danger';
  getStockBadgeText: (stock: number) => string;
}

const ProductStockCell = memo<ProductStockCellProps>(function ProductStockCell({
  product,
  getStockBadgeVariant,
  getStockBadgeText,
}) {
  return (
    <StatusBadge variant={getStockBadgeVariant(product.stock)}>
      {getStockBadgeText(product.stock)}
    </StatusBadge>
  );
});

interface ProductDateCellProps {
  product: Product;
}

const ProductDateCell = memo<ProductDateCellProps>(function ProductDateCell({
  product,
}) {
  return (
    <span className="text-sm">
      {new Date(product.updated_at).toLocaleDateString()}
    </span>
  );
});

// Action Button Components - 개별 버튼으로 분리하여 최적화
interface EditButtonProps {
  product: Product;
  onEdit: (product: Product) => void;
  label: string;
}

const EditButton = memo<EditButtonProps>(function EditButton({
  product,
  onEdit,
  label,
}) {
  const handleClick = useCallback(() => {
    onEdit(product);
  }, [product, onEdit]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="h-8 w-8 p-0"
      aria-label={label}
    >
      <Edit className="h-4 w-4" />
    </Button>
  );
});

interface CloneButtonProps {
  product: Product;
  onClone: (product: Product) => void;
  label: string;
}

const CloneButton = memo<CloneButtonProps>(function CloneButton({
  product,
  onClone,
  label,
}) {
  const handleClick = useCallback(() => {
    onClone(product);
  }, [product, onClone]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="h-8 w-8 p-0"
      aria-label={label}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
});

interface ProductActionsCellProps {
  product: Product;
  onEdit: (product: Product) => void;
  onClone: (product: Product) => void;
  editLabel: string;
  cloneLabel: string;
}

const ProductActionsCell = memo<ProductActionsCellProps>(
  function ProductActionsCell({
    product,
    onEdit,
    onClone,
    editLabel,
    cloneLabel,
  }) {
    return (
      <div className="flex items-center space-x-2">
        <EditButton product={product} onEdit={onEdit} label={editLabel} />
        <CloneButton product={product} onClone={onClone} label={cloneLabel} />
      </div>
    );
  }
);

// Delete Confirmation Modal - 별도 컴포넌트로 분리
interface DeleteConfirmModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: string) => Promise<void>;
  t: (key: string, params?: any) => string;
}

const DeleteConfirmModal = memo<DeleteConfirmModalProps>(
  function DeleteConfirmModal({ product, onClose, onConfirm, t }) {
    const handleConfirm = useCallback(async () => {
      if (product) {
        await onConfirm(product.id);
        onClose();
      }
    }, [product, onConfirm, onClose]);

    if (!product) return null;

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('products.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('products.deleteConfirmMessage', {
                name: product.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="h-5 w-5 text-red-400 mr-2">⚠️</div>
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    {t('products.deleteWarningTitle')}
                  </h4>
                  <p className="text-sm text-red-600 mt-1">
                    {t('products.deleteWarningMessage')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleConfirm}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

// Main Products Page Component
const ProductsPage = memo(function ProductsPage() {
  const { t } = useTranslation();

  // 각 상태를 개별적으로 구독 (완전한 리렌더링 방지)
  const selectedProducts = useProductsStore((state) => state.selectedProducts);
  const toggleProductSelection = useProductsStore(
    (state) => state.toggleProductSelection
  );
  const selectAllProducts = useProductsStore(
    (state) => state.selectAllProducts
  );
  const clearSelection = useProductsStore((state) => state.clearSelection);
  const clearAllFilters = useProductsStore((state) => state.clearAllFilters);

  // 데이터 관련 상태들
  const products = useProductsStore((state) => state.products);
  const categories = useProductsStore((state) => state.categories);
  const loading = useProductsStore((state) => state.loading);
  const error = useProductsStore((state) => state.error);
  const searchTerm = useProductsStore((state) => state.searchTerm);
  const selectedCategory = useProductsStore((state) => state.selectedCategory);
  const sortField = useProductsStore((state) => state.sortField);
  const sortOrder = useProductsStore((state) => state.sortOrder);
  const editingProduct = useProductsStore((state) => state.editingProduct);

  // Pagination 상태들
  const currentPage = useProductsStore((state) => state.currentPage);
  const itemsPerPage = useProductsStore((state) => state.itemsPerPage);
  const totalItems = useProductsStore((state) => state.totalItems);

  // 액션 함수들
  const setSearchTerm = useProductsStore((state) => state.setSearchTerm);
  const setSelectedCategory = useProductsStore(
    (state) => state.setSelectedCategory
  );
  const setSorting = useProductsStore((state) => state.setSorting);
  const setEditingProduct = useProductsStore(
    (state) => state.setEditingProduct
  );
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const addProduct = useProductsStore((state) => state.addProduct);
  const deleteProduct = useProductsStore((state) => state.deleteProduct);
  const refreshData = useProductsStore((state) => state.refreshData);
  const bulkDeleteProducts = useProductsStore(
    (state) => state.bulkDeleteProducts
  );
  const cloneProduct = useProductsStore((state) => state.cloneProduct);
  const exportProductsToExcel = useProductsStore(
    (state) => state.exportProductsToExcel
  );
  const setCurrentPage = useProductsStore((state) => state.setCurrentPage);
  const setItemsPerPage = useProductsStore((state) => state.setItemsPerPage);

  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stable references using refs
  const handleEditProductRef = useRef<(product: Product) => void>(() => {});
  const handleCloneProductRef = useRef<(product: Product) => void>(() => {});
  const formatPriceRef = useRef<(price: number) => string>(() => '');
  const getStockBadgeVariantRef = useRef<
    (stock: number) => 'success' | 'warning' | 'danger'
  >(() => 'success');
  const getStockBadgeTextRef = useRef<(stock: number) => string>(() => '');
  const tRef = useRef(t);

  tRef.current = t;

  useEffect(() => {
    refreshData();

    // Cleanup function to clear all filters and selection when leaving the page
    return () => {
      clearAllFilters(); // This clears both filters and selection
    };
  }, [refreshData, clearAllFilters]);

  // Memoized calculations
  const kpiData = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, product) => sum + product.price * product.stock,
      0
    );
    const lowStockProducts = products.filter(
      (product) => product.stock < 10
    ).length;
    const outOfStockProducts = products.filter(
      (product) => product.stock === 0
    ).length;

    return { totalProducts, totalValue, lowStockProducts, outOfStockProducts };
  }, [products]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  }, []);

  const getStockBadgeVariant = useCallback(
    (stock: number): 'success' | 'warning' | 'danger' => {
      if (stock === 0) return 'danger';
      if (stock < 10) return 'warning';
      return 'success';
    },
    []
  );

  const getStockBadgeText = useCallback(
    (stock: number) => {
      if (stock === 0) return t('products.outOfStock');
      if (stock < 10) return t('products.lowStock');
      return t('products.inStock');
    },
    [t]
  );

  // Stable handlers that don't change reference
  const stableHandleEditProduct = useCallback(
    (product: Product) => {
      setEditingProduct(product);
    },
    [setEditingProduct]
  );

  const stableHandleCloneProduct = useCallback(
    async (product: Product) => {
      await cloneProduct(product);
    },
    [cloneProduct]
  );

  // Update refs
  handleEditProductRef.current = stableHandleEditProduct;
  handleCloneProductRef.current = stableHandleCloneProduct;
  formatPriceRef.current = formatPrice;
  getStockBadgeVariantRef.current = getStockBadgeVariant;
  getStockBadgeTextRef.current = getStockBadgeText;

  // Handlers - 메모이제이션된 핸들러
  const handleCloseEditModal = useCallback(() => {
    setEditingProduct(null);
  }, [setEditingProduct]);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleProductSubmit = useCallback(
    async (data: any) => {
      setFormLoading(true);
      try {
        if (editingProduct) {
          const updatedProduct = { ...editingProduct, ...data };
          await updateProduct(updatedProduct);
        } else {
          await addProduct(data);
        }
      } finally {
        setFormLoading(false);
      }
    },
    [editingProduct, updateProduct, addProduct]
  );

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      await deleteProduct(productId);
    },
    [deleteProduct]
  );

  const handleCloseDeleteModal = useCallback(() => {
    setDeletingProduct(null);
  }, []);

  // 라벨들을 메모이제이션
  const actionLabels = useMemo(
    () => ({
      edit: t('products.editProduct'),
      clone: t('products.cloneProduct'),
    }),
    [t]
  );

  // Static column definitions with stable cell renderers
  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        id: 'image',
        header: t('products.image'),
        sortable: false,
        width: '80px',
        cell: (product: Product) => <ProductImageCell product={product} />,
      },
      {
        id: 'name',
        header: t('products.name'),
        sortable: true,
        cell: (product: Product) => <ProductNameCell product={product} />,
      },
      {
        id: 'price',
        header: t('products.price'),
        sortable: true,
        cell: (product: Product) => (
          <ProductPriceCell
            product={product}
            formatPrice={formatPriceRef.current!}
          />
        ),
      },
      {
        id: 'stock',
        header: t('products.stock'),
        sortable: true,
        cell: (product: Product) => (
          <ProductStockCell
            product={product}
            getStockBadgeVariant={getStockBadgeVariantRef.current!}
            getStockBadgeText={getStockBadgeTextRef.current!}
          />
        ),
      },
      {
        id: 'updated_at',
        header: t('products.lastModified'),
        sortable: true,
        cell: (product: Product) => <ProductDateCell product={product} />,
      },
      {
        id: 'actions',
        header: t('common.actions'),
        sortable: false,
        width: '120px',
        cell: (product: Product) => (
          <ProductActionsCell
            product={product}
            onEdit={handleEditProductRef.current!}
            onClone={handleCloneProductRef.current!}
            editLabel={actionLabels.edit}
            cloneLabel={actionLabels.clone}
          />
        ),
      },
    ],
    [t, actionLabels] // Only depend on t and actionLabels, not on handlers
  );

  // Filter options for SearchBar
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category,
        label: category === 'all' ? t('products.allCategories') : category,
      })),
    [categories, t]
  );

  // Bulk actions
  const bulkActions = useMemo(
    () => [
      {
        id: 'edit',
        label: t('products.bulkEdit'),
        variant: 'outline' as const,
        icon: <Edit className="h-4 w-4" />,
        onClick: () => {
          /* Handle bulk edit */
        },
      },
      {
        id: 'delete',
        label: t('products.bulkDelete'),
        variant: 'destructive' as const,
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => bulkDeleteProducts(selectedProducts),
      },
    ],
    [t, bulkDeleteProducts, selectedProducts]
  );

  // Header actions - 완전히 독립적인 메모이제이션
  const headerActions = useMemo(
    () => (
      <>
        <Button variant="outline" onClick={refreshData} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          {t('common.refresh')}
        </Button>
        <Button variant="outline" onClick={exportProductsToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {t('products.excelExport')}
        </Button>
        <Button variant="outline" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          {t('products.addProduct')}
        </Button>
      </>
    ),
    [refreshData, loading, exportProductsToExcel, handleOpenAddModal, t]
  );

  // KPI Section - 독립적인 메모이제이션
  const kpiSection = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <KPICard
          title={t('products.totalProducts')}
          value={kpiData.totalProducts}
          icon={Package}
          loading={loading}
          description={t('products.registeredProducts')}
        />
        <KPICard
          title={t('products.totalStockValue')}
          value={formatPrice(kpiData.totalValue)}
          icon={DollarSign}
          loading={loading}
          description={t('products.currentStock')}
        />
        <KPICard
          title={t('products.lowStockProducts')}
          value={kpiData.lowStockProducts}
          icon={TrendingUp}
          loading={loading}
          description={t('products.lessThan10')}
          valueFormatter={(val) => `${val}`}
        />
        <KPICard
          title={t('products.outOfStockProducts')}
          value={kpiData.outOfStockProducts}
          icon={Trash2}
          loading={loading}
          description={t('products.zeroStock')}
          valueFormatter={(val) => `${val}`}
        />
      </motion.div>
    ),
    [kpiData, loading, formatPrice, t]
  );

  // Controls Section - 독립적인 메모이제이션
  const controlsSection = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <SearchBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder={t('products.searchByName')}
          filterValue={selectedCategory}
          onFilterChange={setSelectedCategory}
          filterOptions={categoryOptions}
          filterPlaceholder={t('products.categorySelect')}
          debounceMs={1500} // 1.5초 debounce
        />
        <BulkActionBar
          selectedCount={selectedProducts.length}
          onClearSelection={clearSelection}
          actions={bulkActions}
        />
      </motion.div>
    ),
    [
      searchTerm,
      selectedCategory,
      categoryOptions,
      selectedProducts.length,
      setSearchTerm,
      setSelectedCategory,
      clearSelection,
      bulkActions,
      t,
    ]
  );

  // Table Section - 독립적인 메모이제이션
  const tableSection = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DataTable
          data={products}
          columns={columns}
          loading={loading}
          error={error}
          sortConfig={{
            field: sortField || '',
            order: sortOrder === 'none' ? null : sortOrder,
          }}
          onSort={(field) => setSorting(field as SortField)}
          selectedItems={selectedProducts}
          onItemSelect={toggleProductSelection}
          onSelectAll={selectAllProducts}
          getItemId={(product) => product.id}
          emptyStateIcon={Package}
          emptyStateTitle={t('products.noProducts') || 'No products found'}
          emptyStateDescription={
            t('products.productListDescription', {
              count: products.length.toString(),
            }) || 'No products found'
          }
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
      products,
      columns,
      loading,
      error,
      sortField,
      sortOrder,
      selectedProducts,
      setSorting,
      toggleProductSelection,
      selectAllProducts,
      t,
      currentPage,
      itemsPerPage,
      totalItems,
      setCurrentPage,
      setItemsPerPage,
    ]
  );

  // Add Modal - 조건부 렌더링으로 최적화
  const addModal = useMemo(() => {
    if (!showAddModal) return null;

    return (
      <ProductFormModal
        open={true}
        onOpenChange={handleCloseAddModal}
        categories={categories}
        onSubmit={handleProductSubmit}
        loading={formLoading}
      />
    );
  }, [
    showAddModal,
    handleCloseAddModal,
    categories,
    handleProductSubmit,
    formLoading,
  ]);

  // Edit Modal - 조건부 렌더링으로 최적화
  const editModal = useMemo(() => {
    if (!editingProduct) return null;

    return (
      <ProductFormModal
        open={true}
        onOpenChange={handleCloseEditModal}
        product={editingProduct}
        categories={categories}
        onSubmit={handleProductSubmit}
        loading={formLoading}
      />
    );
  }, [
    editingProduct,
    handleCloseEditModal,
    categories,
    handleProductSubmit,
    formLoading,
  ]);

  // Delete Modal - 조건부 렌더링으로 최적화
  const deleteModal = useMemo(() => {
    if (!deletingProduct) return null;

    return (
      <DeleteConfirmModal
        product={deletingProduct}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteProduct}
        t={t}
      />
    );
  }, [deletingProduct, handleCloseDeleteModal, handleDeleteProduct, t]);

  return (
    <>
      <ProductsTemplate
        title={t('products.managementTitle')}
        description={t('products.managementDescription')}
        headerActions={headerActions}
        kpiSection={kpiSection}
        controlsSection={controlsSection}
        tableSection={tableSection}
        modals={null} // modals를 별도로 렌더링
        loading={loading}
      />
      {addModal}
      {editModal}
      {deleteModal}
    </>
  );
});

export default ProductsPage;
