import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { create } from 'zustand';

// 디버깅용 로그 저장 함수
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}`;

  console.log(message, data || '');

  // localStorage에도 저장 (최대 100개 로그 유지)
  try {
    const logs = JSON.parse(localStorage.getItem('auth-debug-logs') || '[]');
    logs.push(logEntry);
    if (logs.length > 100) logs.shift(); // 오래된 로그 제거
    localStorage.setItem('auth-debug-logs', JSON.stringify(logs));
  } catch (e) {
    // localStorage 오류 무시
  }
};

// 저장된 로그 확인 함수 (브라우저 콘솔에서 사용)
const getDebugLogs = () => {
  try {
    const logs = JSON.parse(localStorage.getItem('auth-debug-logs') || '[]');
    console.log('📋 저장된 인증 디버그 로그:');
    logs.forEach((log: string) => console.log(log));
    return logs;
  } catch (e) {
    console.log('로그를 불러올 수 없습니다:', e);
    return [];
  }
};

// 로그 지우기 함수
const clearDebugLogs = () => {
  localStorage.removeItem('auth-debug-logs');
  console.log('✅ 디버그 로그가 지워졌습니다');
};

// 전역에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).getAuthDebugLogs = getDebugLogs;
  (window as any).clearAuthDebugLogs = clearDebugLogs;
}

// 사용자를 commerce_user 테이블에 저장하는 함수
const handleUserCreation = async (user: User) => {
  try {
    debugLog('👤 사용자 정보:', {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
    });

    // 이미 commerce_user 테이블에 존재하는지 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('commerce_user')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116은 "not found" 에러코드
      debugLog('❌ 사용자 존재 확인 에러:', checkError);
      return;
    }

    if (existingUser) {
      debugLog('ℹ️ 사용자가 이미 commerce_user 테이블에 존재함');
      return;
    }

    // commerce_user 테이블에 새 사용자 추가
    const { data, error } = await supabase
      .from('commerce_user')
      .insert({
        id: user.id,
        email: user.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      debugLog('❌ 사용자 저장 실패:', error);
    } else {
      debugLog('✅ 사용자 commerce_user 테이블에 저장 성공:', data);
    }
  } catch (error) {
    debugLog('❌ 사용자 처리 중 오류:', error);
  }
};

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
  signInWithGitHub: () => Promise<{ success: boolean; error?: string }>;
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
      debugLog('🔐 Supabase 로그인 시도:', email);
      set({ error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        debugLog('❌ 로그인 실패:', error.message);
        set({ error: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        set({ user: data.user, error: null });
        debugLog('✅ 로그인 성공:', data.user.email);

        // commerce_user 테이블에 사용자가 없으면 저장 (마이그레이션 대비)
        await handleUserCreation(data.user);

        return { success: true };
      }

      return { success: false, error: '로그인에 실패했습니다.' };
    } catch (error) {
      debugLog('❌ 로그인 에러:', error);
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
      debugLog('📝 Supabase 회원가입 시도:', email);
      set({ error: null });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        debugLog('❌ 회원가입 실패:', error.message);
        set({ error: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        debugLog('✅ 회원가입 성공:', data.user.email);

        // commerce_user 테이블에 사용자 정보 저장
        await handleUserCreation(data.user);

        // 이메일 확인이 필요한 경우
        if (!data.user.email_confirmed_at) {
          debugLog('📧 이메일 확인 필요');
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
      debugLog('❌ 회원가입 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '회원가입 중 오류가 발생했습니다.';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signInWithGitHub: async () => {
    try {
      debugLog('🐙 GitHub 로그인 시도');
      set({ error: null });

      const redirectTo = `${window.location.origin}/dashboard`;
      debugLog('🔗 OAuth redirectTo URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo,
        },
      });

      if (error) {
        debugLog('❌ GitHub 로그인 실패:', error.message);
        set({ error: error.message });
        return { success: false, error: error.message };
      }

      // OAuth URL 로그 출력
      if (data?.url) {
        debugLog('🌐 GitHub OAuth URL:', data.url);
      }

      debugLog('✅ GitHub 로그인 리다이렉트 시작');
      // OAuth는 리다이렉트 기반이므로 여기서는 성공으로 반환
      // 실제 인증 결과는 onAuthStateChange에서 처리됨
      return { success: true };
    } catch (error) {
      debugLog('❌ GitHub 로그인 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'GitHub 로그인 중 오류가 발생했습니다.';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      debugLog('👋 로그아웃 시도');

      const { error } = await supabase.auth.signOut();

      if (error) {
        debugLog('❌ 로그아웃 에러:', error.message);
        set({ error: error.message });
      } else {
        set({ user: null, error: null });
        debugLog('✅ 로그아웃 완료');
      }
    } catch (error) {
      debugLog('❌ 로그아웃 에러:', error);
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
      debugLog('🔄 Supabase 인증 시스템 초기화 시작');

      // URL에서 OAuth 토큰 확인
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.href;
        const hashParams = window.location.hash;
        const searchParams = window.location.search;

        debugLog('🌐 현재 URL 정보:', {
          url: currentUrl,
          hash: hashParams,
          search: searchParams,
        });

        // OAuth 관련 파라미터가 있는지 확인
        if (
          hashParams.includes('access_token') ||
          hashParams.includes('error') ||
          searchParams.includes('code') ||
          searchParams.includes('error')
        ) {
          debugLog('🔑 OAuth 파라미터 감지됨');

          // URL fragment에서 수동으로 토큰 처리 시도
          if (hashParams.includes('access_token')) {
            debugLog('🔧 수동 토큰 처리 시도');
            try {
              const { data, error } = await supabase.auth.getSession();
              if (error) {
                debugLog('❌ 수동 세션 확인 실패:', error);
              } else {
                debugLog(
                  '✅ 수동 세션 확인 성공:',
                  data.session?.user?.email || 'no user'
                );
              }
            } catch (e) {
              debugLog('❌ 수동 처리 중 오류:', e);
            }
          }
        }
      }

      // 현재 세션 확인
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        debugLog('❌ 세션 확인 에러:', error.message);
        set({ error: error.message });
      } else if (session?.user) {
        set({ user: session.user });
        debugLog('✅ 기존 세션 복구:', session.user.email);
      } else {
        debugLog('ℹ️ 기존 세션 없음');
      }

      // 인증 상태 변경 리스너 설정
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        debugLog('🔄 인증 상태 변경:', {
          event,
          userEmail: session?.user?.email || 'null',
          hasSession: !!session,
          hasUser: !!session?.user,
          provider: session?.user?.app_metadata?.provider,
        });

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              set({ user: session.user, error: null });
              debugLog('✅ SIGNED_IN 처리 완료:', session.user.email);

              // 사용자를 commerce_user 테이블에 저장
              debugLog('💾 commerce_user 테이블에 사용자 저장 시도');
              handleUserCreation(session.user);
            }
            break;
          case 'SIGNED_OUT':
            set({ user: null, error: null });
            debugLog('👋 SIGNED_OUT 처리 완료');
            break;
          case 'TOKEN_REFRESHED':
            set({ user: session?.user ?? null });
            debugLog('🔄 TOKEN_REFRESHED 처리 완료');
            break;
          case 'USER_UPDATED':
            set({ user: session?.user ?? null });
            debugLog('📝 USER_UPDATED 처리 완료');
            break;
          default:
            debugLog('❓ 알 수 없는 인증 이벤트:', event);
            break;
        }
      });

      debugLog('✅ 인증 시스템 초기화 완료');
    } catch (error) {
      debugLog('❌ 인증 초기화 에러:', error);
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
