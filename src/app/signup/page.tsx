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
  Info,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signIn, signInWithGitHub, user, error, loading, clearError } =
    useAuthStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);

  // 이미 로그인된 사용자는 대시보드로 리다이렉트 (loading 완료 후)
  useEffect(() => {
    if (!loading && user) {
      console.log('✅ 인증 완료, 대시보드로 리다이렉트:', user.email);
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // 에러 상태 동기화
  useEffect(() => {
    if (error) {
      setLocalError(error);
      clearError();
    }
  }, [error, clearError]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return t('auth.passwordMinLength');
    }
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('auth.invalidEmail');
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!email || !password || !confirmPassword) {
      setLocalError(t('auth.allFieldsRequired'));
      setIsLoading(false);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setLocalError(emailError);
      setIsLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setLocalError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password);

      if (result.success) {
        if (result.error) {
          // 이메일 확인이 필요한 경우
          setSuccess(result.error);
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          // 즉시 로그인 가능한 경우
          setSuccess(t('auth.signupSuccess'));

          if (autoLogin) {
            setSuccess(t('auth.signupCompleteAutoLogin'));

            setTimeout(async () => {
              const loginResult = await signIn(email, password);
              if (loginResult.success) {
                setSuccess(t('auth.loginSuccess'));
                setTimeout(() => {
                  router.push('/dashboard');
                }, 1000);
              } else {
                setSuccess(t('auth.signupCompleteRedirect'));
                setTimeout(() => {
                  router.push('/login');
                }, 2000);
              }
            }, 1000);
          } else {
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          }
        }
      } else {
        setLocalError(result.error || t('auth.signupError'));
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      setLocalError(t('auth.signupError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setLocalError('');
    setSuccess('');
    setIsGitHubLoading(true);

    try {
      const result = await signInWithGitHub();

      if (result.success) {
        setSuccess(t('auth.githubRedirecting'));
        // OAuth 리다이렉트가 시작되므로 로딩 상태를 유지
      } else {
        setLocalError(result.error || t('auth.githubSignupError'));
        setIsGitHubLoading(false);
      }
    } catch (error) {
      console.error('GitHub 회원가입 에러:', error);
      setLocalError(t('auth.githubSignupFailure'));
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t('auth.signupTitle')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.signupDescription')}
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
                    placeholder={t('auth.passwordMinLength').replace(
                      'Password must be at least 6 characters long.',
                      '최소 6자 이상'
                    )}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading || isGitHubLoading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 cursor-pointer"
                    disabled={isLoading || isGitHubLoading}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('auth.confirmPassword')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.confirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading || isGitHubLoading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 cursor-pointer"
                    disabled={isLoading || isGitHubLoading}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* 자동 로그인 옵션 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoLogin"
                  checked={autoLogin}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  disabled={isLoading || isGitHubLoading}
                />
                <Label
                  htmlFor="autoLogin"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {t('auth.autoLoginOption')}
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isGitHubLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {autoLogin
                      ? t('auth.signingUpAndLoggingIn')
                      : t('auth.signingUp')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <User className="h-4 w-4 mr-2" />
                    {t('auth.signup')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            {/* GitHub 회원가입 구분선 */}
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

            {/* GitHub 회원가입 버튼 */}
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGitHubSignUp}
                disabled={isLoading || isGitHubLoading}
              >
                {isGitHubLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {t('auth.githubSignupLoading')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Github className="h-4 w-4 mr-2" />
                    {t('auth.signUpWithGitHub')}
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

              {/* Supabase 회원가입 정보 */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  {t('auth.signupGuide')}
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                  <p>{t('auth.signupFeatures.emailAccount')}</p>
                  <p>{t('auth.signupFeatures.githubSignup')}</p>
                  <p>{t('auth.signupFeatures.emailConfirmation')}</p>
                  <p>{t('auth.signupFeatures.strongPassword')}</p>
                  <p className="text-blue-500 dark:text-blue-400 mt-2">
                    {t('auth.pleaseCheckEmail')}
                  </p>
                </div>
              </div>

              {/* 기존 계정으로 로그인 */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {t('auth.loginHere')}
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
