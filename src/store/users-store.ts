import { User } from '@/lib/supabase';
import { create } from 'zustand';

/**
 * 사용자 페이지 UI 상태 관리 스토어
 * - React Query를 사용하므로 서버 데이터는 저장하지 않음
 * - UI 상태만 관리: 검색, 선택된 사용자
 */
export interface UsersState {
  searchTerm: string;
  selectedUser: User | null;
  setSearchTerm: (term: string) => void;
  setSelectedUser: (user: User | null) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  searchTerm: '',
  selectedUser: null,

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },
}));
