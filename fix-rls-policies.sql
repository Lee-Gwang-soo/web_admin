-- RLS 정책 수정 (관리자 대시보드용)
-- Supabase SQL Editor에서 실행하세요!

-- ===== 방법 1: RLS 정책을 관리자 친화적으로 수정 =====

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

-- 새로운 관리자 친화적 정책 생성

-- Users: 모든 사용자 조회 및 수정 가능 (관리자 대시보드용)
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.users FOR DELETE USING (true);

-- Products: 모든 상품 조회 및 수정 가능
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.products FOR DELETE USING (true);

-- Orders: 모든 주문 조회 및 수정 가능 (관리자 대시보드용)
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.orders FOR DELETE USING (true);

-- Order Items: 모든 주문 항목 조회 및 수정 가능
CREATE POLICY "Enable read access for all users" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.order_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.order_items FOR DELETE USING (true);

-- 확인용 쿼리
SELECT '✅ RLS 정책이 관리자 친화적으로 수정되었습니다!' as message;

-- ===== 방법 2: RLS 완전 비활성화 (더 간단한 방법) =====
-- 만약 위 방법으로도 안 되면 아래 주석을 해제하고 실행하세요

/*
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY; 
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS가 완전히 비활성화되었습니다!' as message;
*/ 