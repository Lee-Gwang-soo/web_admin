'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme-store';
import { Monitor, Moon, Sun } from 'lucide-react';
import { memo } from 'react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const ThemeToggle = memo(function ThemeToggle({
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, isLoading } =
    useThemeStore();

  // 성능 최적화: 아이콘 미리 정의
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return '라이트 모드';
      case 'dark':
        return '다크 모드';
      case 'system':
        return '시스템 설정';
      default:
        return '라이트 모드';
    }
  };

  // 로딩 중일 때는 기본 아이콘 표시
  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={cn('transition-opacity opacity-50', className)}
      >
        <Monitor className="h-4 w-4" />
        {showLabel && <span className="ml-2">테마 로딩중...</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        'transition-all duration-200 hover:scale-105 active:scale-95',
        className
      )}
      title={`현재: ${getThemeLabel()}`}
    >
      {getThemeIcon()}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">{getThemeLabel()}</span>
      )}
    </Button>
  );
});

// 드롭다운 방식의 테마 선택기
interface ThemeDropdownProps {
  className?: string;
}

export const ThemeDropdown = memo(function ThemeDropdown({
  className,
}: ThemeDropdownProps) {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { value: 'light' as const, label: '라이트 모드', icon: Sun },
    { value: 'dark' as const, label: '다크 모드', icon: Moon },
    { value: 'system' as const, label: '시스템 설정', icon: Monitor },
  ];

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      {themes.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={theme === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme(value)}
          className="justify-start"
        >
          <Icon className="h-4 w-4 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  );
});

export default ThemeToggle;
