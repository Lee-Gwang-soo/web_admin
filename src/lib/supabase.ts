import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseUrl = 'https://qzqzqzqzqzqzqzqzqzqz.supabase.co';
const supabaseAnonKey = 'qzqzqzqzqzqzqzqzqzqz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}
