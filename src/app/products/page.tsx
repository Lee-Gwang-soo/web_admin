'use client';

import {
  DateCell,
  ImageCell,
  PriceCell,
  StockBadgeCell,
  TextCell,
  ActionButtonCell,
} from '@/components/atoms/cells';
import { BulkActionBar, KPICard, SearchBar } from '@/components/molecules';
import { ColumnDef, DataTable, ProductFormModal } from '@/components/organisms';
import { ProductsTemplate } from '@/components/templates';
import { Button } from '@/components/ui/button';
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
  useBulkDeleteProducts,
  useDeleteProduct,
  useProductCategories,
  useProducts,
  useUpdateProduct,
  useAddProduct,
  useProductKPI,
} from '@/hooks/useProductsQueries';
import { Product } from '@/lib/supabase';
import { useTranslation } from '@/store/i18n-store';
import { useProductsStore } from '@/store/products-store';
import { motion } from 'framer-motion';
import {
  Copy,
  DollarSign,
  Edit,
  FileSpreadsheet,
  Package,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Delete Confirmation Modal
function DeleteConfirmModal({
  product,
  onClose,
  onConfirm,
  t,
}: {
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: string) => Promise<void>;
  t: (key: string, params?: any) => string;
}) {
  if (!product) return null;

  const handleConfirm = async () => {
    await onConfirm(product.id);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('products.deleteConfirmTitle')}</DialogTitle>
          <DialogDescription>
            {t('products.deleteConfirmMessage', { name: product.name })}
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

export default function ProductsPage() {
  const { t } = useTranslation();

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = `${t('products.title')} - Admin Dashboard`;
  }, [t]);

  // UI 상태 (Zustand)
  const {
    searchTerm,
    selectedCategory,
    sortField,
    sortOrder,
    editingProduct,
    selectedProducts,
    currentPage,
    itemsPerPage,
    setSearchTerm,
    setSelectedCategory,
    setSorting,
    setEditingProduct,
    toggleProductSelection,
    selectAllProducts,
    clearSelection,
    clearAllFilters,
    exportProductsToExcel,
    setCurrentPage,
    setItemsPerPage,
  } = useProductsStore();

  // 서버 데이터 (React Query)
  const {
    data: allProducts = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts(searchTerm, selectedCategory);
  const { data: rawCategories = [] } = useProductCategories();
  const { data: kpiDataRaw } = useProductKPI();

  // Mutations
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllFilters();
    };
  }, [clearAllFilters]);

  // 카테고리 옵션
  const categories = ['all', ...rawCategories];

  // 테이블 상태 관리
  const { sortedData, totalItems, getCurrentPageIds } = useTableState({
    data: allProducts,
    sortField: sortField || undefined,
    sortOrder,
    currentPage,
    itemsPerPage,
    selectedItems: selectedProducts,
    getItemId: (product) => product.id,
  });

  // KPI 데이터
  const kpiData = {
    totalProducts: kpiDataRaw?.totalProducts || 0,
    totalValue: kpiDataRaw?.totalStockValue || 0,
    lowStockProducts: kpiDataRaw?.lowStockProducts || 0,
    outOfStockProducts: kpiDataRaw?.outOfStockProducts || 0,
  };

  // Handlers
  const handleEditProduct = useCallback(
    (product: Product) => {
      setEditingProduct(product);
    },
    [setEditingProduct]
  );

  const handleCloneProduct = useCallback(
    async (product: Product) => {
      const clonedData = {
        name: `${product.name} (복사본)`,
        category: product.category,
        price: product.price,
        stock: product.stock,
        images: product.images || [],
      };
      await addProductMutation.mutateAsync(clonedData);
    },
    [addProductMutation]
  );

  const handleProductSubmit = useCallback(
    async (data: any) => {
      setFormLoading(true);
      try {
        const productData = {
          ...data,
          images: data.image_url ? [data.image_url] : [],
        };
        delete productData.image_url;

        if (editingProduct) {
          const updatedProduct = { ...editingProduct, ...productData };
          await updateProductMutation.mutateAsync(updatedProduct);
          setEditingProduct(null);
        } else {
          await addProductMutation.mutateAsync(productData);
          setShowAddModal(false);
        }
      } finally {
        setFormLoading(false);
      }
    },
    [
      editingProduct,
      updateProductMutation,
      addProductMutation,
      setEditingProduct,
    ]
  );

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      await deleteProductMutation.mutateAsync(productId);
    },
    [deleteProductMutation]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedProducts.length > 0) {
      await bulkDeleteMutation.mutateAsync(selectedProducts);
      clearSelection();
    }
  }, [selectedProducts, bulkDeleteMutation, clearSelection]);

  const handleSelectAll = useCallback(() => {
    const currentPageIds = getCurrentPageIds();
    selectAllProducts(currentPageIds);
  }, [getCurrentPageIds, selectAllProducts]);

  const handleRefresh = useCallback(() => {
    refetchProducts();
  }, [refetchProducts]);

  const handleExport = useCallback(() => {
    exportProductsToExcel(allProducts);
  }, [exportProductsToExcel, allProducts]);

  // Column definitions (memoized to prevent unnecessary re-renders)
  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        id: 'image',
        header: t('products.image'),
        sortable: false,
        width: '80px',
        cell: (product) => (
          <div className="flex items-center justify-center">
            <ImageCell
              src={product.images?.[0] || product.image_url}
              alt={product.name}
              className="rounded object-cover"
            />
          </div>
        ),
        mobileCell: (product) => (
          <ImageCell
            src={product.images?.[0] || product.image_url}
            alt={product.name}
            width={128}
            height={128}
            className="rounded-lg object-cover w-full h-full"
          />
        ),
      },
      {
        id: 'name',
        header: t('products.name'),
        sortable: true,
        cell: (product) => (
          <TextCell text={product.name} secondary={product.category} />
        ),
      },
      {
        id: 'price',
        header: t('products.price'),
        sortable: true,
        cell: (product) => <PriceCell amount={product.price} />,
      },
      {
        id: 'stock',
        header: t('products.stock'),
        sortable: true,
        cell: (product) => (
          <StockBadgeCell
            stock={product.stock}
            labels={{
              inStock: t('products.inStock'),
              lowStock: t('products.lowStock'),
              outOfStock: t('products.outOfStock'),
            }}
          />
        ),
      },
      {
        id: 'updated_at',
        header: t('products.lastModified'),
        sortable: true,
        cell: (product) => <DateCell date={product.updated_at} />,
      },
      {
        id: 'actions',
        header: t('common.actions'),
        sortable: false,
        width: '120px',
        cell: (product) => (
          <div className="flex items-center space-x-2">
            <ActionButtonCell
              icon={Edit}
              onClick={() => handleEditProduct(product)}
              label={t('products.editProduct')}
            />
            <ActionButtonCell
              icon={Copy}
              onClick={() => handleCloneProduct(product)}
              label={t('products.cloneProduct')}
            />
          </div>
        ),
      },
    ],
    [t, handleEditProduct, handleCloneProduct]
  );

  const categoryOptions = categories.map((category) => ({
    value: category,
    label: category === 'all' ? t('products.allCategories') : category,
  }));

  const bulkActions = [
    {
      id: 'delete',
      label: t('products.bulkDelete'),
      variant: 'destructive' as const,
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
    },
  ];

  return (
    <>
      <ProductsTemplate
        title={t('products.managementTitle')}
        description={t('products.managementDescription')}
        kpiSection={
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
              loading={productsLoading}
              description={t('products.registeredProducts')}
            />
            <KPICard
              title={t('products.totalStockValue')}
              value={new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
              }).format(kpiData.totalValue)}
              icon={DollarSign}
              loading={productsLoading}
              description={t('products.currentStock')}
            />
            <KPICard
              title={t('products.lowStockProducts')}
              value={kpiData.lowStockProducts}
              icon={TrendingUp}
              loading={productsLoading}
              description={t('products.lessThan10')}
              valueFormatter={(val) => `${val}`}
            />
            <KPICard
              title={t('products.outOfStockProducts')}
              value={kpiData.outOfStockProducts}
              icon={Trash2}
              loading={productsLoading}
              description={t('products.zeroStock')}
              valueFormatter={(val) => `${val}`}
            />
          </motion.div>
        }
        controlsSection={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={t('products.categorySelect')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex-1 w-full sm:max-w-4xl">
                  <SearchBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder={t('products.searchByName')}
                    debounceMs={1500}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('products.addProduct')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={productsLoading}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${productsLoading ? 'animate-spin' : ''}`}
                  />
                  {t('common.refresh')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="flex-1 sm:flex-none"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('products.excelExport')}
                </Button>
              </div>
            </div>

            <BulkActionBar
              selectedCount={selectedProducts.length}
              onClearSelection={clearSelection}
              actions={bulkActions}
            />
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
              loading={productsLoading}
              error={null}
              sortConfig={{
                field: sortField || '',
                order: sortOrder === 'none' ? null : sortOrder,
              }}
              onSort={(field) => setSorting(field as any)}
              selectedItems={selectedProducts}
              onItemSelect={toggleProductSelection}
              onSelectAll={handleSelectAll}
              getItemId={(product) => product.id}
              emptyStateIcon={Package}
              emptyStateTitle={t('products.noProducts') || 'No products found'}
              emptyStateDescription={
                t('products.productListDescription', {
                  count: sortedData.length.toString(),
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
        }
        modals={null}
        loading={productsLoading}
      />
      {showAddModal && (
        <ProductFormModal
          open={true}
          onOpenChange={() => setShowAddModal(false)}
          categories={rawCategories}
          onSubmit={handleProductSubmit}
          loading={formLoading}
        />
      )}
      {editingProduct && (
        <ProductFormModal
          open={true}
          onOpenChange={() => setEditingProduct(null)}
          product={editingProduct}
          categories={rawCategories}
          onSubmit={handleProductSubmit}
          loading={formLoading}
        />
      )}
      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDeleteProduct}
          t={t}
        />
      )}
    </>
  );
}
