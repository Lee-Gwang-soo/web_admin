import { create } from 'zustand';

/**
 * 대시보드 UI 상태 관리 스토어
 * - React Query를 사용하므로 서버 데이터는 저장하지 않음
 * - UI 상태 (날짜 필터, 자동 새로고침 인터벌)만 관리
 */
export interface DashboardState {
  dateFilter: 'today' | 'yesterday' | 'week';
  autoRefreshInterval: NodeJS.Timeout | null;
  setDateFilter: (filter: 'today' | 'yesterday' | 'week') => void;
  startRealTimeUpdates: (callback: () => void) => void;
  stopRealTimeUpdates: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dateFilter: 'today',
  autoRefreshInterval: null,

  setDateFilter: (filter) => {
    set({ dateFilter: filter });
  },

  startRealTimeUpdates: (callback) => {
    const { stopRealTimeUpdates } = get();

    // Stop existing interval
    stopRealTimeUpdates();

    // Start new interval for 60-second updates (1분마다 자동 새로고침)
    const interval = setInterval(() => {
      callback(); // React Query refetch callback 실행
    }, 60000);

    set({ autoRefreshInterval: interval });
  },

  stopRealTimeUpdates: () => {
    const { autoRefreshInterval } = get();
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      set({ autoRefreshInterval: null });
    }
  },
}));
