'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: '대시보드 및 KPI',
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    description: '주문 관리',
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
    description: '상품 관리',
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    description: '사용자 관리',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: '상세 분석',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: '설정',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuthStore();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Admin Panel</span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'Guest User'}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              <div className="flex-1">
                <div>{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}
