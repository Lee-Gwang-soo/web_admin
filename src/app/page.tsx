'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = 'E-commerce Admin Dashboard';
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gradient-to-br from-blue-50 to-indigo-100 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                >
                  <span className="block xl:inline">E-commerce</span>{' '}
                  <span className="block text-blue-600 xl:inline">
                    대시보드
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                >
                  실시간 데이터 모니터링과 비즈니스 인사이트를 통해 더 나은
                  비즈니스 결정을 내리세요. 강력한 분석 도구와 직관적인
                  인터페이스로 성장을 가속화하세요.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                >
                  <div className="rounded-md shadow">
                    <Button
                      onClick={() => router.push('/login')}
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium"
                    >
                      시작하기
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium"
                    >
                      데모 보기
                    </Button>
                  </div>
                </motion.div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-[48.5%]">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center"
          >
            <div className="text-white text-6xl">
              <BarChart3 size={120} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base text-blue-600 font-semibold tracking-wide uppercase"
            >
              핵심 기능
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            >
              비즈니스 성장을 위한 도구
            </motion.p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: DollarSign,
                  title: '실시간 매출 추적',
                  description:
                    '시간별, 일별 매출 데이터를 실시간으로 모니터링하세요',
                  delay: 0.6,
                },
                {
                  icon: TrendingUp,
                  title: '고급 분석',
                  description:
                    '전환율, 성장률 등 핵심 지표를 한눈에 확인하세요',
                  delay: 0.7,
                },
                {
                  icon: Users,
                  title: '고객 인사이트',
                  description: '활성 사용자와 고객 행동 패턴을 분석하세요',
                  delay: 0.8,
                },
                {
                  icon: BarChart3,
                  title: '시각적 대시보드',
                  description: '직관적인 차트와 그래프로 데이터를 시각화하세요',
                  delay: 0.9,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <feature.icon className="h-12 w-12 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            <span className="block">지금 바로 시작하세요</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-4 text-lg leading-6 text-blue-200"
          >
            강력한 대시보드로 비즈니스를 한 단계 업그레이드하세요.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Button
              onClick={() => router.push('/login')}
              className="mt-8 w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50"
            >
              로그인하여 시작하기
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
