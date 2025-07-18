'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsersStore } from '@/store/users-store';
import { motion } from 'framer-motion';
import { Calendar, Eye, Search, ShoppingBag, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    searchTerm,
    selectedUser,
    userOrders,
    fetchUsers,
    setSearchTerm,
    setSelectedUser,
    fetchUserOrders,
  } = useUsersStore();

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    setSearchTerm(value);
  };

  const handleViewUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      await fetchUserOrders(userId);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">사용자 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              오류가 발생했습니다: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">사용자 관리</h1>
              <p className="text-gray-600 mt-1">
                등록된 사용자들을 관리하고 주문 내역을 확인하세요
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {users.length}
              </span>
              <span className="text-gray-500">명</span>
            </div>
          </div>

          {/* 검색 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="사용자 이름 또는 이메일로 검색..."
                  value={localSearchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* 사용자 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email.split('@')[0]}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          활성
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user.id)}
                              className="cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              상세보기
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>사용자 상세 정보</DialogTitle>
                              <DialogDescription>
                                {selectedUser?.email}의 정보와 주문 내역
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {selectedUser && (
                                <>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">
                                        이름
                                      </Label>
                                      <p>{selectedUser.email.split('@')[0]}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        이메일
                                      </Label>
                                      <p>{selectedUser.email}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        가입일
                                      </Label>
                                      <p>
                                        {new Date(
                                          selectedUser.created_at
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        총 주문 수
                                      </Label>
                                      <p>{userOrders.length}개</p>
                                    </div>
                                  </div>

                                  {userOrders.length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2 flex items-center">
                                        <ShoppingBag className="h-4 w-4 mr-1" />
                                        주문 내역
                                      </h4>
                                      <div className="max-h-60 overflow-y-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>주문번호</TableHead>
                                              <TableHead>금액</TableHead>
                                              <TableHead>상태</TableHead>
                                              <TableHead>주문일</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {userOrders.map((order) => (
                                              <TableRow key={order.id}>
                                                <TableCell className="font-mono text-sm">
                                                  #{order.id.slice(-8)}
                                                </TableCell>
                                                <TableCell>
                                                  ₩
                                                  {order.total_amount?.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                  <Badge
                                                    variant={
                                                      order.status ===
                                                      'delivered'
                                                        ? 'default'
                                                        : 'secondary'
                                                    }
                                                  >
                                                    {order.status ===
                                                      'pending' && '대기중'}
                                                    {order.status ===
                                                      'payment_confirmed' &&
                                                      '처리중'}
                                                    {order.status ===
                                                      'shipped' && '배송중'}
                                                    {order.status ===
                                                      'delivered' && '배송완료'}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>
                                                  {new Date(
                                                    order.created_at
                                                  ).toLocaleDateString()}
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  사용자가 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
