-- E-commerce 대시보드 데이터베이스 스키마

-- 8글자 주문 ID 생성 함수
CREATE OR REPLACE FUNCTION generate_order_id() RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    -- 중복 체크
    WHILE EXISTS(SELECT 1 FROM public.orders WHERE id = result) LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 1. Users 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products 테이블
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Orders 테이블 (8글자 ID로 변경)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders (
    id TEXT DEFAULT generate_order_id() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'payment_confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned')),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    customer_name TEXT,
    customer_email TEXT,
    shipping_address TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Order Items 테이블 (주문 ID 타입 변경)
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

-- RLS 정책 생성 (기본적인 보안 설정)
-- Users: 본인의 데이터만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Products: 모든 사용자가 조회 가능 (관리자만 수정)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Orders: 본인의 주문만 조회 가능
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Order Items: 본인의 주문 항목만 조회 가능
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    ));

-- updated_at 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS handle_updated_at ON public.users;
DROP TRIGGER IF EXISTS handle_updated_at ON public.products;
DROP TRIGGER IF EXISTS handle_updated_at ON public.orders;

-- updated_at 트리거 생성
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Realtime 활성화 (실시간 업데이트용)
-- 기존에 추가된 테이블들을 먼저 제거하고 다시 추가 (오류 발생 시 무시)
DO $$
BEGIN
  -- 기존 테이블들을 publication에서 제거 (오류 무시)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;
  EXCEPTION WHEN others THEN
    NULL; -- 오류 무시
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.order_items;
  EXCEPTION WHEN others THEN
    NULL; -- 오류 무시
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.products;
  EXCEPTION WHEN others THEN
    NULL; -- 오류 무시
  END;
  
  -- 다시 추가
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN others THEN
    NULL; -- 오류 무시
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  EXCEPTION WHEN others THEN
    NULL; -- 오류 무시
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN others THEN
    NULL; -- 오류 무시
  END;
END $$; 