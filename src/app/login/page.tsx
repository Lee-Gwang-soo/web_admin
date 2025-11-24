'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/store/i18n-store';
import { motion } from 'framer-motion';
import {
  AlertCircle,
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

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = `${t('auth.signIn')} - Admin Dashboard`;
  }, [t]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // 저장된 이메일 복원
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

  // URL에서 OAuth 에러 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const urlError = urlParams.get('error') || hashParams.get('error');
      const errorDescription =
        urlParams.get('error_description') ||
        hashParams.get('error_description');

      if (urlError) {
        let friendlyMessage = '';
        if (
          errorDescription?.includes('Multiple accounts with the same email')
        ) {
          friendlyMessage =
            '같은 이메일로 이미 계정이 존재합니다. 이메일/패스워드 로그인을 사용해주세요.';
        } else {
          friendlyMessage = `로그인 실패: ${errorDescription || urlError}`;
        }

        setLocalError(friendlyMessage);

        // URL에서 에러 파라미터 제거
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-slate-900 dark:text-white"
          >
            {t('auth.login')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-slate-600 dark:text-slate-400 mt-2"
          >
            관리자 대시보드에 접속하세요
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {localError && (
              <Alert
                variant="destructive"
                className="animate-in fade-in-0 slide-in-from-top-1"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{localError}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 animate-in fade-in-0 slide-in-from-top-1">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-slate-700 dark:text-slate-300"
              >
                {t('auth.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  disabled={isLoading || isGitHubLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-slate-700 dark:text-slate-300"
              >
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  disabled={isLoading || isGitHubLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 transition-colors"
                  disabled={isLoading || isGitHubLoading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                disabled={isLoading || isGitHubLoading}
              />
              <Label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                {t('auth.rememberMe')}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all"
              disabled={isLoading || isGitHubLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('common.loading')}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="h-5 w-5 mr-2" />
                  {t('auth.login')}
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                  {t('auth.or')}
                </span>
              </div>
            </div>
          </div>

          {/* GitHub Login */}
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={handleGitHubLogin}
              disabled={isLoading || isGitHubLoading}
            >
              {isGitHubLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  {t('auth.githubLoginLoading')}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Github className="h-5 w-5 mr-2" />
                  {t('auth.signInWithGitHub')}
                </div>
              )}
            </Button>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('auth.noAccount')}{' '}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                {t('auth.signup')}
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
