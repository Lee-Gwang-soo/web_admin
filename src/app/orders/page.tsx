'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderWithItems } from '@/lib/supabase';
import { OrderSortField, useOrdersStore } from '@/store/orders-store';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckSquare,
  DollarSign,
  Eye,
  FileSpreadsheet,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Square,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Order status badge configuration
const getStatusBadge = (status: string) => {
  const statusConfig: Record<
    string,
    { label: string; variant: any; color: string }
  > = {
    pending: {
      label: '주문접수',
      variant: 'secondary',
      color: 'bg-yellow-100 text-yellow-800',
    },
    payment_confirmed: {
      label: '결제완료',
      variant: 'default',
      color: 'bg-blue-100 text-blue-800',
    },
    preparing: {
      label: '배송준비',
      variant: 'default',
      color: 'bg-purple-100 text-purple-800',
    },
    shipped: {
      label: '배송중',
      variant: 'default',
      color: 'bg-green-100 text-green-800',
    },
    delivered: {
      label: '배송완료',
      variant: 'default',
      color: 'bg-gray-100 text-gray-800',
    },
    cancelled: {
      label: '취소',
      variant: 'destructive',
      color: 'bg-red-100 text-red-800',
    },
    returned: {
      label: '반품',
      variant: 'outline',
      color: 'bg-gray-100 text-gray-600',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
};

// Order Details Modal Component
interface OrderDetailsModalProps {
  order: OrderWithItems;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}

function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 업데이트에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const totalItems =
    order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <DialogContent
      className="w-[98vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
      style={{ maxWidth: '1400px' }}
    >
      <DialogHeader className="flex-shrink-0 pb-4 border-b">
        <DialogTitle className="text-lg font-semibold">
          주문 상세보기
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-600 mt-1">
          주문 정보와 상품 목록을 확인하고 상태를 관리할 수 있습니다.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Order Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">주문 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-gray-600 font-medium">
                  주문 ID:
                </span>
                <span className="text-sm font-mono break-all sm:max-w-[200px]">
                  {order.id}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-gray-600 font-medium">
                  고객 이메일:
                </span>
                <span className="text-sm break-all">
                  {order.user?.email || '알 수 없음'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-gray-600 font-medium">
                  주문 일시:
                </span>
                <span className="text-sm">
                  {new Date(order.created_at).toLocaleString('ko-KR')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-gray-600 font-medium">
                  총 상품 수:
                </span>
                <span className="text-sm font-semibold">{totalItems}개</span>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">결제 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-gray-600 font-medium">
                  총 결제 금액:
                </span>
                <span className="text-lg font-bold text-green-600">
                  {order.total_amount.toLocaleString()}원
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  주문 상태:
                </span>
                {getStatusBadge(order.status)}
              </div>
              <div className="pt-2 space-y-2">
                <label className="text-sm font-medium">상태 변경:</label>
                <Select onValueChange={handleStatusUpdate} disabled={updating}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="새 상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">주문접수</SelectItem>
                    <SelectItem value="payment_confirmed">결제완료</SelectItem>
                    <SelectItem value="preparing">배송준비</SelectItem>
                    <SelectItem value="shipped">배송중</SelectItem>
                    <SelectItem value="delivered">배송완료</SelectItem>
                    <SelectItem value="cancelled">취소</SelectItem>
                    <SelectItem value="returned">반품</SelectItem>
                  </SelectContent>
                </Select>
                {updating && (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      업데이트 중...
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>주문 상품 목록</span>
              <span className="text-xs text-gray-500 font-normal">
                {order.order_items?.length || 0}개 상품
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mobile view - Card layout */}
              <div className="block sm:hidden space-y-3">
                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm leading-tight">
                          {item.product?.name || '상품 정보 없음'}
                        </h4>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.product?.category || '-'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">단가:</span>
                          <span className="font-medium">
                            {item.price.toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">수량:</span>
                          <span className="font-medium">{item.quantity}개</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t">
                        <span className="text-sm font-medium text-gray-700">
                          소계:
                        </span>
                        <span className="font-bold text-green-600">
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view - Table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">상품명</TableHead>
                      <TableHead className="min-w-[100px]">카테고리</TableHead>
                      <TableHead className=" min-w-[80px]">단가</TableHead>
                      <TableHead className=" min-w-[60px]">수량</TableHead>
                      <TableHead className=" min-w-[100px]">소계</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.order_items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div
                            className="max-w-[200px] truncate"
                            title={item.product?.name}
                          >
                            {item.product?.name || '상품 정보 없음'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.product?.category || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className=" font-medium">
                          {item.price.toLocaleString()}원
                        </TableCell>
                        <TableCell className="">{item.quantity}개</TableCell>
                        <TableCell className=" font-bold text-green-600">
                          {(item.price * item.quantity).toLocaleString()}원
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">총 {totalItems}개 상품</span>
                  </div>
                  <div className="">
                    <div className="text-lg font-bold text-green-600">
                      총 {order.total_amount.toLocaleString()}원
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
}

export default function OrdersPage() {
  const {
    orders,
    statuses,
    loading,
    error,
    searchTerm,
    selectedStatus,
    sortField,
    sortOrder,
    selectedOrders,
    bulkStatusUpdate,
    fetchOrders,
    fetchStatuses,
    setSearchTerm,
    setSelectedStatus,
    setSorting,
    updateOrderStatus,
    toggleOrderSelection,
    selectAllOrders,
    clearSelection,
    bulkUpdateOrderStatus,
    bulkDeleteOrders,
    setBulkStatusUpdate,
    exportOrdersToExcel,
    refreshData,
  } = useOrdersStore();

  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null
  );

  useEffect(() => {
    console.log('🔍 Orders Page - useEffect triggered, calling refreshData()');
    refreshData();
  }, [refreshData]);

  const getSortIcon = (field: OrderSortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortOrder === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortOrder === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatusUpdate || selectedOrders.length === 0) return;

    try {
      await bulkUpdateOrderStatus(selectedOrders, bulkStatusUpdate);
      alert(`${selectedOrders.length}개 주문의 상태가 업데이트되었습니다.`);
    } catch (error) {
      console.error('Bulk status update failed:', error);
      alert('일괄 상태 업데이트에 실패했습니다.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;

    const confirmed = confirm(
      `선택된 ${selectedOrders.length}개 주문을 삭제하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      await bulkDeleteOrders(selectedOrders);
      alert(`${selectedOrders.length}개 주문이 삭제되었습니다.`);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('일괄 삭제에 실패했습니다.');
    }
  };

  // Calculate summary statistics
  const totalOrders = orders.length;
  // Calculate revenue excluding cancelled and returned orders
  const validOrders = orders.filter(
    (order) => order.status !== 'cancelled' && order.status !== 'returned'
  );
  const totalRevenue = validOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const pendingOrders = orders.filter(
    (order) => order.status === 'pending'
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === 'delivered'
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
              <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
              <p className="text-sm text-gray-600">
                주문 현황을 모니터링하고 상태를 관리합니다
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
          >
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    총 주문 수
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalOrders}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRevenue.toLocaleString()}원
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">처리 대기</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingOrders}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <CheckSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">배송 완료</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedOrders}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="주문 ID 또는 고객 이메일로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full sm:w-40 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'all'
                          ? '전체 상태'
                          : getStatusBadge(status).props.children}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={refreshData}
                  disabled={loading}
                  className="cursor-pointer h-10 flex-1 sm:flex-none"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  새로고침
                </Button>
                <Button
                  variant="outline"
                  onClick={exportOrdersToExcel}
                  className="cursor-pointer h-10 flex-1 sm:flex-none"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel 내보내기
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedOrders.length}개 주문 선택됨
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    className="cursor-pointer w-fit"
                  >
                    선택 해제
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Select
                    value={bulkStatusUpdate || ''}
                    onValueChange={setBulkStatusUpdate}
                  >
                    <SelectTrigger className="w-full sm:w-40 h-10">
                      <SelectValue placeholder="상태 변경" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">주문접수</SelectItem>
                      <SelectItem value="payment_confirmed">
                        결제완료
                      </SelectItem>
                      <SelectItem value="preparing">배송준비</SelectItem>
                      <SelectItem value="shipped">배송중</SelectItem>
                      <SelectItem value="delivered">배송완료</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                      <SelectItem value="returned">반품</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkStatusUpdate}
                      disabled={!bulkStatusUpdate}
                      className="cursor-pointer flex-1 sm:flex-none h-10"
                    >
                      상태 업데이트
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="cursor-pointer flex-1 sm:flex-none h-10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>주문 목록</CardTitle>
                <CardDescription>
                  등록된 모든 주문을 관리하고 상태를 추적할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="overflow-x-auto">
                  {/* Mobile view - Card layout */}
                  <div className="block sm:hidden space-y-3">
                    {loading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          주문 목록을 불러오는 중...
                        </p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">주문이 없습니다.</p>
                        <p className="text-sm text-gray-400">
                          필터를 조정하거나 새로운 주문을 기다려보세요.
                        </p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOrderSelection(order.id)}
                              className="p-0 h-auto cursor-pointer"
                            >
                              {selectedOrders.includes(order.id) ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs text-gray-500">주문 ID</p>
                                <p className="font-mono text-sm">{order.id}</p>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>

                            <div className="mb-2 flex justify-center">
                              <p className="text-xs text-center">품목</p>
                              <p className="text-sm truncate">
                                {(() => {
                                  const items = order.order_items || [];
                                  if (items.length === 0) return '없음';

                                  const firstProduct =
                                    items[0]?.product?.name || '알 수 없음';
                                  if (items.length === 1) {
                                    return firstProduct;
                                  } else {
                                    return `${firstProduct} 外 ${items.length - 1}개`;
                                  }
                                })()}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-gray-500">고객</p>
                                <p className="truncate">
                                  {order.user?.email || '알 수 없음'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">금액</p>
                                <p className="font-semibold text-green-600">
                                  {order.total_amount.toLocaleString()}원
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-gray-500">상품 수</p>
                                <Badge variant="outline" className="text-xs">
                                  {order.order_items?.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0
                                  ) || 0}
                                  개
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  주문 일시
                                </p>
                                <p className="text-xs">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop view - Table layout */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[5%]">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={
                                selectedOrders.length === orders.length
                                  ? clearSelection
                                  : selectAllOrders
                              }
                              className="p-0 h-auto cursor-pointer"
                            >
                              {selectedOrders.length === orders.length ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[10%]">주문 ID</TableHead>
                          <TableHead className="w-[25%]">품목</TableHead>
                          <TableHead className="w-[10%]">
                            <Button
                              variant="ghost"
                              onClick={() => setSorting('customer_email')}
                              className="cursor-pointer p-0 h-auto font-semibold"
                            >
                              고객 이메일
                              {getSortIcon('customer_email')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[10%]">
                            <Button
                              variant="ghost"
                              onClick={() => setSorting('status')}
                              className="cursor-pointer p-0 h-auto font-semibold"
                            >
                              상태
                              {getSortIcon('status')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[10%]">
                            <Button
                              variant="ghost"
                              onClick={() => setSorting('total_amount')}
                              className="cursor-pointer p-0 h-auto font-semibold "
                            >
                              총 금액
                              {getSortIcon('total_amount')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[10%]">상품 수</TableHead>
                          <TableHead className="w-[10%]">
                            <Button
                              variant="ghost"
                              onClick={() => setSorting('created_at')}
                              className="cursor-pointer p-0 h-auto font-semibold"
                            >
                              주문 일시
                              {getSortIcon('created_at')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[10%]">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                              <p className="text-gray-500">
                                주문 목록을 불러오는 중...
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">주문이 없습니다.</p>
                              <p className="text-sm text-gray-400">
                                필터를 조정하거나 새로운 주문을 기다려보세요.
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((order) => (
                            <TableRow
                              key={order.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="w-[5%]">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleOrderSelection(order.id)}
                                  className="p-0 h-auto cursor-pointer"
                                >
                                  {selectedOrders.includes(order.id) ? (
                                    <CheckSquare className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="w-[10%] font-mono text-sm">
                                {order.id}
                              </TableCell>
                              <TableCell className="w-[25%] truncate">
                                {(() => {
                                  const items = order.order_items || [];
                                  if (items.length === 0) return '없음';

                                  const firstProduct =
                                    items[0]?.product?.name || '알 수 없음';
                                  if (items.length === 1) {
                                    return firstProduct;
                                  } else {
                                    return `${firstProduct} 外 ${items.length - 1}개`;
                                  }
                                })()}
                              </TableCell>
                              <TableCell className="w-[10%] truncate">
                                {order.user?.email || '알 수 없음'}
                              </TableCell>
                              <TableCell className="w-[10%]">
                                {getStatusBadge(order.status)}
                              </TableCell>
                              <TableCell className="w-[10%]  font-medium">
                                {order.total_amount.toLocaleString()}원
                              </TableCell>
                              <TableCell className="w-[10%]">
                                <Badge variant="outline">
                                  {order.order_items?.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0
                                  ) || 0}
                                  개
                                </Badge>
                              </TableCell>
                              <TableCell className="w-[10%]">
                                {new Date(order.created_at).toLocaleDateString(
                                  'ko-KR'
                                )}
                              </TableCell>
                              <TableCell className="w-[10%] ">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <Dialog
            open={!!selectedOrder}
            onOpenChange={() => setSelectedOrder(null)}
          >
            <OrderDetailsModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusUpdate={updateOrderStatus}
            />
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}
