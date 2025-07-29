'use client';

import LanguageSelector from '@/components/common/LanguageSelector';
import ThemeToggle from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/store/i18n-store';
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
    nameKey: 'navigation.dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    nameKey: 'navigation.orders',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    nameKey: 'navigation.products',
    href: '/products',
    icon: Package,
  },
  {
    nameKey: 'navigation.users',
    href: '/users',
    icon: Users,
  },
  {
    nameKey: 'navigation.analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    nameKey: 'navigation.settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar dark:bg-sidebar border-r border-sidebar-border dark:border-sidebar-border transition-colors">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-6 border-b border-sidebar-border dark:border-sidebar-border">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-primary dark:text-primary" />
          <span className="text-xl font-bold text-sidebar-foreground dark:text-sidebar-foreground">
            {t('common.adminPanel')}
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-sidebar-border dark:border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-sidebar-accent dark:bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground dark:text-sidebar-accent-foreground">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground dark:text-sidebar-foreground truncate">
              {user?.email || 'Guest User'}
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              {t('users.admin')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.nameKey}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-sidebar-accent dark:bg-sidebar-accent text-sidebar-accent-foreground dark:text-sidebar-accent-foreground border-r-2 border-sidebar-primary dark:border-sidebar-primary'
                  : 'text-sidebar-foreground dark:text-sidebar-foreground hover:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-sidebar-primary dark:text-sidebar-primary'
                    : 'text-muted-foreground dark:text-muted-foreground group-hover:text-sidebar-accent-foreground dark:group-hover:text-sidebar-accent-foreground'
                )}
              />
              <div className="flex-1">
                <div>{t(item.nameKey)}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Theme and Language Controls */}
      <div className="px-3 py-2 border-t border-sidebar-border dark:border-sidebar-border space-y-2">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-sidebar-foreground dark:text-sidebar-foreground">
            {t('navigation.theme')}
          </span>
          <ThemeToggle />
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-sidebar-foreground dark:text-sidebar-foreground">
            {t('navigation.language')}
          </span>
          <LanguageSelector />
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-sidebar-border dark:border-sidebar-border">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground dark:text-sidebar-foreground hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent/50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t('auth.logout')}
        </Button>
      </div>
    </div>
  );
}
