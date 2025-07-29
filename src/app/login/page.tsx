'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/store/i18n-store';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Github,
  Lock,
  LogIn,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGitHub, user, error, loading, clearError } =
    useAuthStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 이미 로그인된 사용자는 대시보드로 리다이렉트 (loading 완료 후)
  useEffect(() => {
    const debugMessage = `🔍 로그인 페이지 - 인증 상태 확인: { loading: ${loading}, user: ${user?.email || 'null'}, hasUser: ${!!user} }`;
    console.log(debugMessage);

    // localStorage에도 저장
    try {
      const logs = JSON.parse(localStorage.getItem('auth-debug-logs') || '[]');
      logs.push(`[${new Date().toISOString()}] ${debugMessage}`);
      if (logs.length > 100) logs.shift();
      localStorage.setItem('auth-debug-logs', JSON.stringify(logs));
    } catch (e) {
      // localStorage 오류 무시
    }

    if (!loading && user) {
      const successMessage = `✅ 인증 완료, 대시보드로 리다이렉트: ${user.email}`;
      console.log(successMessage);

      // localStorage에도 저장
      try {
        const logs = JSON.parse(
          localStorage.getItem('auth-debug-logs') || '[]'
        );
        logs.push(`[${new Date().toISOString()}] ${successMessage}`);
        if (logs.length > 100) logs.shift();
        localStorage.setItem('auth-debug-logs', JSON.stringify(logs));
      } catch (e) {
        // localStorage 오류 무시
      }

      router.push('/dashboard');
    } else if (!loading && !user) {
      const infoMessage = 'ℹ️ 로딩 완료, 사용자 없음 - 로그인 페이지 유지';
      console.log(infoMessage);

      // localStorage에도 저장
      try {
        const logs = JSON.parse(
          localStorage.getItem('auth-debug-logs') || '[]'
        );
        logs.push(`[${new Date().toISOString()}] ${infoMessage}`);
        if (logs.length > 100) logs.shift();
        localStorage.setItem('auth-debug-logs', JSON.stringify(logs));
      } catch (e) {
        // localStorage 오류 무시
      }
    }
  }, [user, loading, router]);

  // 저장된 로그인 정보 복원
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedRememberMe && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // 에러 상태 동기화
  useEffect(() => {
    if (error) {
      setLocalError(error);
      clearError();
    }
  }, [error, clearError]);

  // URL에서 OAuth 에러 확인 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const urlError = urlParams.get('error') || hashParams.get('error');
      const errorDescription =
        urlParams.get('error_description') ||
        hashParams.get('error_description');
      const errorCode =
        urlParams.get('error_code') || hashParams.get('error_code');

      if (urlError) {
        console.log('🚨 OAuth 에러 감지:', {
          urlError,
          errorCode,
          errorDescription,
        });

        let friendlyMessage = '';
        if (
          errorDescription?.includes('Multiple accounts with the same email')
        ) {
          friendlyMessage =
            '같은 이메일로 이미 계정이 존재합니다. 기존 이메일/패스워드 로그인을 사용하거나, 관리자에게 계정 연결을 요청하세요.';
        } else if (urlError === 'server_error') {
          friendlyMessage = `서버 오류가 발생했습니다: ${errorDescription || '알 수 없는 오류'}`;
        } else {
          friendlyMessage = `GitHub 로그인 실패: ${errorDescription || urlError}`;
        }

        setLocalError(friendlyMessage);

        // URL에서 에러 파라미터 제거
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []); // 빈 dependency array로 마운트 시에만 실행

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');
    setIsLoading(true);

    if (!email || !password) {
      setLocalError(t('auth.allFieldsRequired'));
      setIsLoading(false);
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError(t('auth.invalidEmail'));
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn(email, password);

      if (result.success) {
        // Remember Me 처리
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }

        setSuccess(t('auth.loginSuccess'));

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setLocalError(result.error || t('auth.loginError'));
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      setLocalError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLocalError('');
    setSuccess('');
    setIsGitHubLoading(true);

    try {
      const result = await signInWithGitHub();

      if (result.success) {
        setSuccess(t('auth.githubRedirecting'));
        // OAuth 리다이렉트가 시작되므로 로딩 상태를 유지
      } else {
        setLocalError(result.error || t('auth.githubLoginError'));
        setIsGitHubLoading(false);
      }
    } catch (error) {
      console.error('GitHub 로그인 에러:', error);
      setLocalError(t('auth.githubLoginFailure'));
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t('auth.login')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.loginDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {localError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{localError}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading || isGitHubLoading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading || isGitHubLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                    disabled={isLoading || isGitHubLoading}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    disabled={isLoading || isGitHubLoading}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {t('auth.rememberMe')}
                  </Label>
                </div>
                <Link
                  href="/signup"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t('auth.signup')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isGitHubLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('common.loading')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('auth.login')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            {/* GitHub 로그인 구분선 */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('auth.or')}
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub 로그인 버튼 */}
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGitHubLogin}
                disabled={isLoading || isGitHubLoading}
              >
                {isGitHubLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {t('auth.githubLoginLoading')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Github className="h-4 w-4 mr-2" />
                    {t('auth.signInWithGitHub')}
                  </div>
                )}
              </Button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('common.info')}
                  </span>
                </div>
              </div>

              {/* Supabase 정보 */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-2">
                  {t('auth.supabaseAuthSystem')}
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                  <p>{t('auth.supabaseFeatures.realAuth')}</p>
                  <p>{t('auth.supabaseFeatures.emailConfirmation')}</p>
                  <p>{t('auth.supabaseFeatures.githubOauth')}</p>
                  <p>{t('auth.supabaseFeatures.secureSession')}</p>
                  <p className="text-blue-500 dark:text-blue-400 mt-2">
                    {t('auth.pleaseSignupFirst')}
                  </p>
                </div>
              </div>

              {/* 회원가입 링크 */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.noAccount')}{' '}
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {t('auth.newAccountCreate')}
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
