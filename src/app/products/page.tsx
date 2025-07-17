'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  FileSpreadsheet,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useProductsStore, SortField } from '@/store/products-store';
import { Label } from '@/components/ui/label';
import { Product, supabaseApi } from '@/lib/supabase';

// Add Product Form Component
interface AddProductFormProps {
  onSave: (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ) => void;
  onCancel: () => void;
}

function AddProductForm({ onSave, onCancel }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl: string | undefined;

      // Upload image if file is selected
      if (selectedFile) {
        imageUrl = await supabaseApi.uploadProductImage(selectedFile);
      }

      onSave({
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image_url: imageUrl,
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="add-name">제품명</Label>
        <Input
          id="add-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="제품명을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="add-category">카테고리</Label>
        <Input
          id="add-category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          placeholder="카테고리를 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="add-price">가격</Label>
        <Input
          id="add-price"
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: Number(e.target.value) })
          }
          placeholder="가격을 입력하세요"
          required
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="add-stock">재고</Label>
        <Input
          id="add-stock"
          type="number"
          value={formData.stock}
          onChange={(e) =>
            setFormData({ ...formData, stock: Number(e.target.value) })
          }
          placeholder="재고 수량을 입력하세요"
          required
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="add-image">상품 이미지</Label>
        <div className="space-y-2">
          <Input
            id="add-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedFile(file);
                // Create preview URL
                const reader = new FileReader();
                reader.onload = () => {
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              } else {
                setSelectedFile(null);
                setImagePreview(null);
              }
            }}
            className="cursor-pointer"
          />
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-32 h-32 object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                  // Reset file input
                  const fileInput = document.getElementById(
                    'add-image'
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="absolute top-1 right-1 h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={uploading}
          className="cursor-pointer hover:bg-blue-600 transition-colors"
        >
          {uploading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              업로드 중...
            </>
          ) : (
            '추가'
          )}
        </Button>
      </div>
    </form>
  );
}

// Edit Product Form Component
interface EditProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

function EditProductForm({ product, onSave, onCancel }: EditProductFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock || 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [keepExistingImage, setKeepExistingImage] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = product.image_url; // Keep existing image by default

      // If new file is selected, upload it and delete old image
      if (selectedFile) {
        imageUrl = await supabaseApi.uploadProductImage(selectedFile);

        // Delete old image if it exists
        if (product.image_url) {
          await supabaseApi.deleteProductImage(product.image_url);
        }
      } else if (!keepExistingImage && product.image_url) {
        // If user chose to remove existing image
        await supabaseApi.deleteProductImage(product.image_url);
        imageUrl = undefined;
      }

      onSave({
        ...product,
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image_url: imageUrl,
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">제품명</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-category">카테고리</Label>
        <Input
          id="edit-category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-price">가격</Label>
        <Input
          id="edit-price"
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: Number(e.target.value) })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-stock">재고</Label>
        <Input
          id="edit-stock"
          type="number"
          value={formData.stock}
          onChange={(e) =>
            setFormData({ ...formData, stock: Number(e.target.value) })
          }
          required
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="edit-image">상품 이미지</Label>
        <div className="space-y-3">
          {/* Show existing image if any */}
          {product.image_url && keepExistingImage && !selectedFile && (
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setKeepExistingImage(false)}
                className="absolute top-1 right-1 h-6 w-6 p-0"
              >
                ×
              </Button>
              <p className="text-sm text-gray-500 mt-1">현재 이미지</p>
            </div>
          )}

          {/* Show message when existing image is removed */}
          {product.image_url && !keepExistingImage && !selectedFile && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-700">
                기존 이미지가 제거됩니다.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setKeepExistingImage(true)}
                className="mt-2"
              >
                기존 이미지 유지
              </Button>
            </div>
          )}

          {/* File input */}
          <Input
            id="edit-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedFile(file);
                setKeepExistingImage(false);
                // Create preview URL
                const reader = new FileReader();
                reader.onload = () => {
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              } else {
                setSelectedFile(null);
                setImagePreview(null);
                setKeepExistingImage(true);
              }
            }}
            className="cursor-pointer"
          />

          {/* Show new image preview */}
          {imagePreview && selectedFile && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="새 이미지 미리보기"
                className="w-32 h-32 object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                  setKeepExistingImage(true);
                  // Reset file input
                  const fileInput = document.getElementById(
                    'edit-image'
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="absolute top-1 right-1 h-6 w-6 p-0"
              >
                ×
              </Button>
              <p className="text-sm text-gray-500 mt-1">새 이미지</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={uploading}
          className="cursor-pointer hover:bg-blue-600 transition-colors"
        >
          {uploading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              업로드 중...
            </>
          ) : (
            '저장'
          )}
        </Button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const {
    products,
    categories,
    loading,
    error,
    searchTerm,
    selectedCategory,
    sortField,
    sortOrder,
    editingProduct,
    selectedProducts,
    bulkEditData,
    setSearchTerm,
    setSelectedCategory,
    setSorting,
    setEditingProduct,
    updateProduct,
    addProduct,
    deleteProduct,
    refreshData,
    // Bulk operations
    toggleProductSelection,
    selectAllProducts,
    clearSelection,
    bulkDeleteProducts,
    bulkUpdateProducts,
    setBulkEditData,
    // Clone operation
    cloneProduct,
    // Export operations
    exportProductsToExcel,
  } = useProductsStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAddProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      await addProduct(productData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteProducts(selectedProducts);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Failed to bulk delete products:', error);
    }
  };

  const handleBulkEdit = async () => {
    if (!bulkEditData) return;

    try {
      await bulkUpdateProducts(selectedProducts, bulkEditData);
      setShowBulkEditModal(false);
    } catch (error) {
      console.error('Failed to bulk edit products:', error);
    }
  };

  const handleCloneProduct = async (product: Product) => {
    try {
      await cloneProduct(product);
    } catch (error) {
      console.error('Failed to clone product:', error);
    }
  };

  const isAllSelected =
    products.length > 0 && selectedProducts.length === products.length;
  const isSomeSelected = selectedProducts.length > 0;

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllProducts();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock < 10) return 'outline';
    return 'secondary';
  };

  const getStockBadgeText = (stock: number) => {
    if (stock === 0) return '품절';
    if (stock < 10) return '재고 부족';
    return '재고 충분';
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }

    if (sortOrder === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    } else if (sortOrder === 'desc') {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    } else {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
  };

  // Calculate KPI data from products
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

  return (
    <AdminLayout>
      <div className="h-full bg-gray-50">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-gray-200 px-6 py-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">제품 관리</h1>
              <p className="text-sm text-gray-600">
                재고 현황과 제품 정보를 관리하세요
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {error && (
                <Badge variant="destructive" className="mr-2">
                  데이터 로드 오류
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={loading}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                새로고침
              </Button>

              {/* Excel Export Button */}
              <Button
                variant="outline"
                onClick={() => exportProductsToExcel()}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel로 내보내기
              </Button>

              <Button
                onClick={() => setShowAddModal(true)}
                className="cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                제품 추가
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="p-6">
          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  총 제품 수
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">등록된 제품</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  총 재고 가치
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(totalValue)}
                </div>
                <p className="text-xs text-muted-foreground">현재 재고 기준</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  재고 부족 제품
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {lowStockProducts}
                </div>
                <p className="text-xs text-muted-foreground">10개 미만 제품</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">품절 제품</CardTitle>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {outOfStockProducts}
                </div>
                <p className="text-xs text-muted-foreground">재고 0개 제품</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border p-4 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              {/* 카테고리 드롭다운 - 왼쪽 */}
              <div className="sm:w-48">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        {category === 'all' ? '전체 카테고리' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 검색창 - 오른쪽 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="제품명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bulk Actions Bar */}
          {isSomeSelected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {selectedProducts.length}개 상품 선택됨
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    선택 해제
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkEditModal(true)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    일괄 수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="text-red-600 border-red-300 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    일괄 삭제
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>제품 목록</CardTitle>
                <CardDescription>
                  총 {products.length}개의 제품이 등록되어 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>데이터를 불러오는 중...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>등록된 제품이 없습니다.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAll}
                            className="h-auto p-1"
                          >
                            {isAllSelected ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="w-20">이미지</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium hover:bg-gray-100 cursor-pointer transition-colors rounded-md px-2 py-1"
                            onClick={() => setSorting('name')}
                          >
                            제품명
                            {getSortIcon('name')}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium hover:bg-gray-100 cursor-pointer transition-colors rounded-md px-2 py-1"
                            onClick={() => setSorting('category')}
                          >
                            카테고리
                            {getSortIcon('category')}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium hover:bg-gray-100 cursor-pointer transition-colors rounded-md px-2 py-1"
                            onClick={() => setSorting('price')}
                          >
                            가격
                            {getSortIcon('price')}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium hover:bg-gray-100 cursor-pointer transition-colors rounded-md px-2 py-1"
                            onClick={() => setSorting('stock')}
                          >
                            재고
                            {getSortIcon('stock')}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium hover:bg-gray-100 cursor-pointer transition-colors rounded-md px-2 py-1"
                            onClick={() => setSorting('status')}
                          >
                            상태
                            {getSortIcon('status')}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium hover:bg-gray-100 cursor-pointer transition-colors rounded-md px-2 py-1"
                            onClick={() => setSorting('created_at')}
                          >
                            등록일
                            {getSortIcon('created_at')}
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="w-12">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProductSelection(product.id)}
                              className="h-auto p-1"
                            >
                              {selectedProducts.includes(product.id) ? (
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="w-20">
                            {product.image_url ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                  />
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{product.name}</DialogTitle>
                                    <DialogDescription>
                                      제품 이미지
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-center">
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="max-w-full max-h-96 object-contain rounded-lg"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>
                            {product.stock?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStockBadgeVariant(product.stock || 0)}
                            >
                              {getStockBadgeText(product.stock || 0)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(product.created_at).toLocaleDateString(
                              'ko-KR'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>{product.name}</DialogTitle>
                                    <DialogDescription>
                                      제품 상세 정보
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">
                                        카테고리
                                      </label>
                                      <p className="text-sm text-gray-600">
                                        {product.category}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        가격
                                      </label>
                                      <p className="text-sm text-gray-600">
                                        {formatPrice(product.price)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        재고 수량
                                      </label>
                                      <p className="text-sm text-gray-600">
                                        {product.stock || 0}개
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        등록일
                                      </label>
                                      <p className="text-sm text-gray-600">
                                        {new Date(
                                          product.created_at
                                        ).toLocaleString('ko-KR')}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        최종 수정일
                                      </label>
                                      <p className="text-sm text-gray-600">
                                        {new Date(
                                          product.updated_at
                                        ).toLocaleString('ko-KR')}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingProduct(product)}
                                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>제품 수정</DialogTitle>
                                    <DialogDescription>
                                      {editingProduct?.name} 정보를 수정합니다
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingProduct && (
                                    <EditProductForm
                                      product={editingProduct}
                                      onSave={updateProduct}
                                      onCancel={() => setEditingProduct(null)}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCloneProduct(product)}
                                className="cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingProduct(product)}
                                className="cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Add Product Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>제품 추가</DialogTitle>
              <DialogDescription>새로운 제품을 등록합니다</DialogDescription>
            </DialogHeader>
            <AddProductForm
              onSave={handleAddProduct}
              onCancel={() => setShowAddModal(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={!!deletingProduct}
          onOpenChange={() => setDeletingProduct(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>제품 삭제</DialogTitle>
              <DialogDescription>
                정말로 &quot;{deletingProduct?.name}&quot; 제품을
                삭제하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <div className="h-5 w-5 text-red-400 mr-2">⚠️</div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      삭제 주의사항
                    </h4>
                    <p className="text-sm text-red-600 mt-1">
                      삭제된 제품은 복구할 수 없습니다. 신중하게 결정해주세요.
                    </p>
                  </div>
                </div>
              </div>

              {deletingProduct && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">제품명:</span>
                    <span className="text-sm">{deletingProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">카테고리:</span>
                    <span className="text-sm">{deletingProduct.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">가격:</span>
                    <span className="text-sm">
                      {formatPrice(deletingProduct.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">재고:</span>
                    <span className="text-sm">{deletingProduct.stock}개</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeletingProduct(null)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProduct}
                  className="cursor-pointer hover:bg-red-600 transition-colors"
                >
                  삭제
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Modal */}
        <Dialog
          open={showBulkDeleteModal}
          onOpenChange={setShowBulkDeleteModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>제품 일괄 삭제</DialogTitle>
              <DialogDescription>
                선택된 {selectedProducts.length}개 제품을 삭제하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <div className="h-5 w-5 text-red-400 mr-2">⚠️</div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      일괄 삭제 주의사항
                    </h4>
                    <p className="text-sm text-red-600 mt-1">
                      삭제된 제품들은 복구할 수 없습니다. 신중하게 결정해주세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-32 overflow-y-auto">
                <div className="text-sm font-medium mb-2">
                  삭제될 제품 목록:
                </div>
                {products
                  .filter((p) => selectedProducts.includes(p.id))
                  .map((product) => (
                    <div
                      key={product.id}
                      className="text-sm text-gray-600 py-1"
                    >
                      • {product.name} ({product.category})
                    </div>
                  ))}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="cursor-pointer hover:bg-red-600 transition-colors"
                >
                  {selectedProducts.length}개 삭제
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Edit Modal */}
        <Dialog open={showBulkEditModal} onOpenChange={setShowBulkEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>제품 일괄 수정</DialogTitle>
              <DialogDescription>
                선택된 {selectedProducts.length}개 제품을 수정합니다
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  빈 필드는 기존 값이 유지됩니다.
                </p>
              </div>

              <div>
                <Label htmlFor="bulk-category">카테고리</Label>
                <Input
                  id="bulk-category"
                  value={bulkEditData?.category || ''}
                  onChange={(e) =>
                    setBulkEditData({
                      ...bulkEditData,
                      category: e.target.value,
                    })
                  }
                  placeholder="새 카테고리 (선택사항)"
                />
              </div>

              <div>
                <Label htmlFor="bulk-price">가격</Label>
                <Input
                  id="bulk-price"
                  type="number"
                  value={bulkEditData?.price || ''}
                  onChange={(e) =>
                    setBulkEditData({
                      ...bulkEditData,
                      price: Number(e.target.value),
                    })
                  }
                  placeholder="새 가격 (선택사항)"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="bulk-stock">재고</Label>
                <Input
                  id="bulk-stock"
                  type="number"
                  value={bulkEditData?.stock || ''}
                  onChange={(e) =>
                    setBulkEditData({
                      ...bulkEditData,
                      stock: Number(e.target.value),
                    })
                  }
                  placeholder="새 재고 (선택사항)"
                  min="0"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkEditModal(false);
                    setBulkEditData(null);
                  }}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  취소
                </Button>
                <Button
                  onClick={handleBulkEdit}
                  disabled={
                    !bulkEditData ||
                    (!bulkEditData.category &&
                      !bulkEditData.price &&
                      !bulkEditData.stock)
                  }
                  className="cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  {selectedProducts.length}개 수정
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
