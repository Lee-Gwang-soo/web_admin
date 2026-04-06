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

// 재시도 유틸리티 함수
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        debugLog(`⏳ 재시도 대기 중... (${attempt + 1}/${maxRetries})`, {
          delay,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// 어드민 사용자를 admin_user 테이블에 저장하는 함수 (성능 최적화 버전)
const handleUserCreation = async (
  user: User,
  skipIfExists = true
): Promise<boolean> => {
  try {
    debugLog('👤 어드민 사용자 정보:', {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
    });

    // 재시도 로직을 포함한 사용자 생성
    const result = await retryWithBackoff(
      async () => {
        // 이미 존재하는지 확인 (선택적)
        if (skipIfExists) {
          const { data: existingUser, error: checkError } = await supabase
            .from('admin_user')
            .select('id')
            .eq('id', user.id)
            .maybeSingle(); // single() 대신 maybeSingle() 사용으로 성능 개선

          if (checkError) {
            debugLog('❌ 사용자 존재 확인 에러:', checkError);
            throw checkError;
          }

          if (existingUser) {
            debugLog('ℹ️ 사용자가 이미 admin_user 테이블에 존재함');
            return { success: true, existed: true };
          }
        }

        // admin_user 테이블에 새 어드민 사용자 추가
        // upsert 사용으로 race condition 방지
        const { data, error } = await supabase
          .from('admin_user')
          .upsert(
            {
              id: user.id,
              email: user.email || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'id',
              ignoreDuplicates: false, // 업데이트도 수행
            }
          )
          .select()
          .single();

        if (error) {
          debugLog('❌ 어드민 사용자 저장 실패:', error);
          throw error;
        }

        debugLog('✅ 어드민 사용자 admin_user 테이블에 저장 성공:', data);
        return { success: true, existed: false };
      },
      1, // 최대 1번 재시도 (RLS 에러는 재시도해도 소용없음)
      300 // 300ms base delay (빠른 실패)
    );

    return result.success;
  } catch (error) {
    debugLog('❌ 어드민 사용자 처리 중 오류 (재시도 실패):', error);
    // Database Trigger가 실패를 대비하여 백업 처리
    // 에러를 throw하지 않고 false 반환 (사용자 경험 개선)
    return false;
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

        // admin_user 테이블에 사용자가 없으면 저장 (마이그레이션 대비)
        // 실패해도 로그인 흐름에 영향 없도록 백그라운드에서 처리
        handleUserCreation(data.user).catch(() => {
          // RLS 정책으로 실패할 수 있음 - 무시
        });

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

        // admin_user 테이블에 어드민 사용자 정보 저장
        // 실패해도 회원가입 흐름에 영향 없도록 백그라운드에서 처리
        handleUserCreation(data.user).catch(() => {
          // RLS 정책으로 실패할 수 있음 - 무시
        });

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
      set({ loading: true, error: null });

      // Supabase 세션 완전히 제거
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        debugLog('❌ 로그아웃 에러:', error.message);
        set({ error: error.message, loading: false });
      } else {
        // 상태 완전히 초기화
        set({ user: null, error: null, loading: false });
        debugLog('✅ 로그아웃 완료');

        // 명시적으로 로그인 페이지로 이동
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      debugLog('❌ 로그아웃 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '로그아웃 중 오류가 발생했습니다.';
      set({ error: errorMessage });
      // 에러가 있어도 로컬 상태는 정리하고 로그인 페이지로 이동
      set({ user: null, loading: false });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  initialize: async () => {
    // 타임아웃 설정 (10초 후 강제로 loading 해제)
    const timeout = setTimeout(() => {
      debugLog('⚠️ 인증 초기화 타임아웃 - 강제로 loading 해제');
      set({ loading: false });
    }, 10000);

    try {
      set({ loading: true, error: null });
      debugLog('🔄 Supabase 인증 시스템 초기화 시작');

      // URL에서 OAuth 토큰 확인
      if (typeof window !== 'undefined') {
        const hashParams = window.location.hash;
        const searchParams = window.location.search;

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
              const result = await Promise.race([
                supabase.auth.getSession(),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Session timeout')), 5000)
                ),
              ]);
              const { data, error } = result as Awaited<
                ReturnType<typeof supabase.auth.getSession>
              >;
              if (error) {
                debugLog('❌ 수동 세션 확인 실패:', error);
              } else if (data && 'session' in data) {
                debugLog(
                  '✅ 수동 세션 확인 성공:',
                  data.session?.user?.email || 'no user'
                );
              }
            } catch (e) {
              debugLog('❌ 수동 처리 중 오류 (타임아웃 포함):', e);
            }
          }
        }
      }

      // 현재 세션 확인 (타임아웃 포함)
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<{ data: { session: null }; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('세션 확인 타임아웃')), 5000)
        ),
      ]).catch((error) => {
        debugLog('❌ 세션 확인 타임아웃:', error);
        return { data: { session: null }, error };
      });

      if (sessionResult.error) {
        debugLog('❌ 세션 확인 에러:', sessionResult.error);
        set({
          error: sessionResult.error.message || String(sessionResult.error),
        });
      } else if (sessionResult.data.session?.user) {
        set({ user: sessionResult.data.session.user });
        debugLog('✅ 기존 세션 복구:', sessionResult.data.session.user.email);
      } else {
        debugLog('ℹ️ 기존 세션 없음');
      }

      // 인증 상태 변경 리스너 설정
      supabase.auth.onAuthStateChange(async (event, session) => {
        debugLog('🔄 인증 상태 변경:', {
          event,
          userEmail: session?.user?.email || 'null',
          hasSession: !!session,
        });

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              set({ user: session.user, error: null });
              debugLog('✅ SIGNED_IN 처리 완료:', session.user.email);

              // 어드민 사용자를 admin_user 테이블에 저장
              handleUserCreation(session.user).catch((error) => {
                debugLog('⚠️ admin_user 레코드 생성 실패:', error);
              });
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
      clearTimeout(timeout);
      set({ loading: false });
      debugLog('✅ 인증 초기화 완료 - loading: false');
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
