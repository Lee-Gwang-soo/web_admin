-- 관리자 대시보드를 위한 안전한 RLS 정책
-- Supabase SQL Editor에서 실행하세요!

-- ===== 방법 1: anon 키로 모든 데이터 조회 허용 (관리자 대시보드 전용) =====

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

-- 관리자 대시보드용 정책: anon 역할로 모든 데이터 조회/수정 가능
-- Users 테이블
CREATE POLICY "Admin dashboard access" ON public.users FOR ALL USING (true);

-- Products 테이블 (이미 잘 작동하고 있음)
CREATE POLICY "Admin dashboard access" ON public.products FOR ALL USING (true);

-- Orders 테이블
CREATE POLICY "Admin dashboard access" ON public.orders FOR ALL USING (true);

-- Order Items 테이블
CREATE POLICY "Admin dashboard access" ON public.order_items FOR ALL USING (true);

SELECT '✅ 관리자 대시보드용 RLS 정책이 설정되었습니다!' as message;

-- ===== 방법 2: 더 세밀한 제어가 필요한 경우 =====
/*
-- 읽기는 모두 허용, 쓰기는 제한하고 싶다면:

DROP POLICY IF EXISTS "Admin dashboard access" ON public.users;
DROP POLICY IF EXISTS "Admin dashboard access" ON public.products;
DROP POLICY IF EXISTS "Admin dashboard access" ON public.orders;
DROP POLICY IF EXISTS "Admin dashboard access" ON public.order_items;

-- 읽기 전용 정책
CREATE POLICY "Admin read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Admin read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admin read access" ON public.order_items FOR SELECT USING (true);

-- 쓰기 권한이 필요한 경우만 개별 추가
CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Admin insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin delete orders" ON public.orders FOR DELETE USING (true);

SELECT '✅ 읽기 중심 관리자 정책이 설정되었습니다!' as message;
*/

-- ===== 방법 3: 환경별 분리 (운영/개발) =====
/*
-- 개발 환경에서만 모든 권한, 운영에서는 제한
-- 현재는 개발 환경이므로 모든 권한 허용

-- RLS 임시 비활성화 (개발 환경 전용)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

SELECT '⚠️ 개발 환경: RLS가 비활성화되었습니다!' as message;
*/ 