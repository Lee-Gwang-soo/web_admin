import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      console.log('🔐 Supabase 로그인 시도:', email);
      set({ error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ 로그인 실패:', error.message);
        set({ error: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        set({ user: data.user, error: null });
        console.log('✅ 로그인 성공:', data.user.email);
        return { success: true };
      }

      return { success: false, error: '로그인에 실패했습니다.' };
    } catch (error) {
      console.error('❌ 로그인 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      console.log('📝 Supabase 회원가입 시도:', email);
      set({ error: null });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error('❌ 회원가입 실패:', error.message);
        set({ error: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ 회원가입 성공:', data.user.email);
        // 이메일 확인이 필요한 경우
        if (!data.user.email_confirmed_at) {
          console.log('📧 이메일 확인 필요');
          return {
            success: true,
            error:
              '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.',
          };
        }

        set({ user: data.user, error: null });
        return { success: true };
      }

      return { success: false, error: '회원가입에 실패했습니다.' };
    } catch (error) {
      console.error('❌ 회원가입 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '회원가입 중 오류가 발생했습니다.';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      console.log('👋 로그아웃 시도');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ 로그아웃 에러:', error.message);
        set({ error: error.message });
      } else {
        set({ user: null, error: null });
        console.log('✅ 로그아웃 완료');
      }
    } catch (error) {
      console.error('❌ 로그아웃 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '로그아웃 중 오류가 발생했습니다.';
      set({ error: errorMessage });
      // 에러가 있어도 로컬 상태는 정리
      set({ user: null });
    }
  },

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      console.log('🔄 Supabase 인증 시스템 초기화 시작');

      // 현재 세션 확인
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ 세션 확인 에러:', error.message);
        set({ error: error.message });
      } else if (session?.user) {
        set({ user: session.user });
        console.log('✅ 기존 세션 복구:', session.user.email);
      } else {
        console.log('ℹ️ 기존 세션 없음');
      }

      // 인증 상태 변경 리스너 설정
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 인증 상태 변경:', event, session?.user?.email);

        switch (event) {
          case 'SIGNED_IN':
            set({ user: session?.user ?? null, error: null });
            break;
          case 'SIGNED_OUT':
            set({ user: null, error: null });
            break;
          case 'TOKEN_REFRESHED':
            set({ user: session?.user ?? null });
            break;
          case 'USER_UPDATED':
            set({ user: session?.user ?? null });
            break;
          default:
            break;
        }
      });

      console.log('✅ 인증 시스템 초기화 완료');
    } catch (error) {
      console.error('❌ 인증 초기화 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '인증 시스템 초기화 중 오류가 발생했습니다.';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
