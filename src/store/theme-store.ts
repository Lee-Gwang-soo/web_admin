import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  isLoading: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initialize: () => void;
}

// 시스템 테마 감지 함수
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

// 로컬스토리지에서 테마 설정 가져오기
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem('theme') as Theme;
    return stored && ['light', 'dark', 'system'].includes(stored)
      ? stored
      : 'system';
  } catch {
    return 'system';
  }
};

// 실제 적용될 테마 계산
const resolveTheme = (
  theme: Theme,
  systemTheme: 'light' | 'dark'
): 'light' | 'dark' => {
  return theme === 'system' ? systemTheme : theme;
};

// DOM에 테마 클래스 적용
const applyTheme = (resolvedTheme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark = resolvedTheme === 'dark';

  // 성능 최적화: 클래스 변경 전 체크
  if (isDark && !root.classList.contains('dark')) {
    root.classList.add('dark');
  } else if (!isDark && root.classList.contains('dark')) {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',
  systemTheme: 'light',
  isLoading: true,

  setTheme: (theme: Theme) => {
    const { systemTheme } = get();
    const resolvedTheme = resolveTheme(theme, systemTheme);

    // 로컬스토리지에 저장
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }

    // DOM에 적용
    applyTheme(resolvedTheme);

    set({ theme, resolvedTheme });
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme: Theme =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    get().setTheme(newTheme);
  },

  initialize: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const systemTheme = getSystemTheme();
    const storedTheme = getStoredTheme();
    const resolvedTheme = resolveTheme(storedTheme, systemTheme);

    // 초기 테마 적용
    applyTheme(resolvedTheme);

    set({
      theme: storedTheme,
      resolvedTheme,
      systemTheme,
      isLoading: false,
    });

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      const { theme } = get();
      const newResolvedTheme = resolveTheme(theme, newSystemTheme);

      applyTheme(newResolvedTheme);

      set({
        systemTheme: newSystemTheme,
        resolvedTheme: newResolvedTheme,
      });
    };

    // 이벤트 리스너 등록 (메모리 누수 방지를 위해 passive 옵션 사용)
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // 클린업 함수 반환 (실제로는 Zustand에서 직접 지원하지 않지만, 패턴 유지)
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  },
}));

// 초기화 헬퍼 함수 (SSR 지원)
export const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    useThemeStore.getState().initialize();
  }
};
