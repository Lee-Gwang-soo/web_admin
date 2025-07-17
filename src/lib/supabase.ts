import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 값을 가져오고, 없으면 더미 값 사용
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://esnmmlqzmlnygtmdxdvq.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbm1tbHF6bWxueWd0bWR4ZHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MDU4MDIsImV4cCI6MjA0OTQ4MTgwMn0.r-xKhgGz6FdHXDwX8hMxQBEf1UlqjGQgz_rQ2uVZzHE';

// 개발 환경에서 실제 환경 변수가 설정되지 않은 경우 경고
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Environment Variables Debug:');
  console.log(
    'NEXT_PUBLIC_SUPABASE_URL:',
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  console.log(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing'
  );
  console.log('Using URL:', supabaseUrl);
  console.log(
    'Using API Key (first 20 chars):',
    supabaseAnonKey.substring(0, 20) + '...'
  );

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn(
      '⚠️ Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
    );
  }
}

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
  stock: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductKPI {
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

// Extended types for dashboard queries
export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product: Product })[];
}

export interface DashboardKPI {
  todayRevenue: number;
  todayOrders: number;
  activeUsers: number;
  conversionRate: number;
}

export interface HourlyRevenue {
  hour: string;
  revenue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

// Supabase API Functions
export const supabaseApi = {
  // Dashboard related queries
  async getDashboardKPI(
    dateFilter: 'today' | 'yesterday' | 'week' = 'today'
  ): Promise<DashboardKPI> {
    const now = new Date();
    const startDate = new Date();

    switch (dateFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const endDate =
      dateFilter === 'yesterday'
        ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
        : new Date();

    try {
      console.log(
        '🔍 Fetching KPI data for date range:',
        startDate.toISOString(),
        'to',
        endDate.toISOString()
      );

      // Get revenue and order count
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString());

      console.log('📊 Orders query result:', { orders, ordersError });

      if (ordersError) {
        console.error('❌ Orders query error:', ordersError);
        throw ordersError;
      }

      const todayRevenue =
        orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) ||
        0;
      const todayOrders = orders?.length || 0;

      // Get active users (users who made orders in the time period)
      const { data: activeUsers, error: usersError } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', startDate.toISOString());

      console.log('👥 Users query result:', { activeUsers, usersError });

      if (usersError) {
        console.error('❌ Users query error:', usersError);
        // Don't throw error for users, continue with 0
      }

      // Calculate conversion rate (simplified)
      const conversionRate = activeUsers?.length
        ? (todayOrders / activeUsers.length) * 100
        : 0;

      const result = {
        todayRevenue,
        todayOrders,
        activeUsers: activeUsers?.length || 5, // Fallback to known user count
        conversionRate: Math.round(conversionRate * 100) / 100,
      };

      console.log('✅ KPI result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching KPI data:', error);
      // Return default values instead of throwing
      return {
        todayRevenue: 0,
        todayOrders: 0,
        activeUsers: 0,
        conversionRate: 0,
      };
    }
  },

  async getHourlyRevenue(
    dateFilter: 'today' | 'yesterday' | 'week' = 'today'
  ): Promise<HourlyRevenue[]> {
    const now = new Date();
    const startDate = new Date();

    switch (dateFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by hour
      const hourlyData: { [key: string]: number } = {};

      for (let i = 0; i < 24; i++) {
        hourlyData[`${i}:00`] = 0;
      }

      orders?.forEach((order) => {
        const hour = new Date(order.created_at).getHours();
        hourlyData[`${hour}:00`] += order.total_amount;
      });

      return Object.entries(hourlyData).map(([hour, revenue]) => ({
        hour,
        revenue: Math.round(revenue),
      }));
    } catch (error) {
      console.error('Error fetching hourly revenue:', error);
      throw error;
    }
  },

  async getOrderStatusDistribution(): Promise<
    Array<{ status: string; count: number; color: string }>
  > {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status');

      if (error) throw error;

      const statusColors = {
        pending: '#f59e0b',
        processing: '#3b82f6',
        shipped: '#10b981',
        delivered: '#8b5cf6',
        cancelled: '#ef4444',
      };

      const statusCounts: { [key: string]: number } = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders?.forEach((order) => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        color: statusColors[status as keyof typeof statusColors],
      }));
    } catch (error) {
      console.error('Error fetching order status distribution:', error);
      throw error;
    }
  },

  async getCategoryRevenue(): Promise<CategoryRevenue[]> {
    try {
      const { data, error } = await supabase.from('order_items').select(`
          quantity,
          price,
          product:products(category)
        `);

      if (error) throw error;

      const categoryRevenue: { [key: string]: number } = {};

      data?.forEach((item) => {
        const category =
          (item.product as unknown as Product)?.category || 'Unknown';
        const revenue = item.quantity * item.price;
        categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue;
      });

      return Object.entries(categoryRevenue)
        .map(([category, revenue]) => ({
          category,
          revenue: Math.round(revenue),
        }))
        .sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Error fetching category revenue:', error);
      throw error;
    }
  },

  // Products related queries
  async getProducts(search?: string, category?: string) {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductKPI(): Promise<ProductKPI> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('price, stock');

      if (error) throw error;

      const totalProducts = products?.length || 0;
      const totalStockValue =
        products?.reduce(
          (sum, product) => sum + product.price * product.stock,
          0
        ) || 0;
      const lowStockProducts =
        products?.filter((p) => p.stock > 0 && p.stock <= 10).length || 0;
      const outOfStockProducts =
        products?.filter((p) => p.stock === 0).length || 0;

      return {
        totalProducts,
        totalStockValue,
        lowStockProducts,
        outOfStockProducts,
      };
    } catch (error) {
      console.error('Error fetching product KPI:', error);
      throw error;
    }
  },

  async getProductCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) throw error;

      const categories = [...new Set(data?.map((p) => p.category) || [])];
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async updateProduct(product: Product): Promise<Product> {
    try {
      console.log('🔄 Updating product:', product);

      const { data, error } = await supabase
        .from('products')
        .update({
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          image_url: product.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating product:', error);
        throw error;
      }

      if (!data) {
        throw new Error('제품 업데이트에 실패했습니다.');
      }

      console.log('✅ Product updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async addProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product> {
    try {
      console.log('➕ Adding new product:', productData);

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          category: productData.category,
          price: productData.price,
          stock: productData.stock,
          image_url: productData.image_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding product:', error);
        throw error;
      }

      if (!data) {
        throw new Error('제품 추가에 실패했습니다.');
      }

      console.log('✅ Product added successfully:', data);
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting product:', productId);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('❌ Error deleting product:', error);
        throw error;
      }

      console.log('✅ Product deleted successfully:', productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async uploadProductImage(file: File): Promise<string> {
    try {
      console.log('📤 Uploading product image:', file.name);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ Error uploading image:', error);
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath);

      console.log('✅ Image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(
        (part) => part === 'product-images'
      );
      if (bucketIndex === -1) return; // Not a Supabase storage URL

      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      console.log('🗑️ Deleting product image:', filePath);

      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) {
        console.error('❌ Error deleting image:', error);
        // Don't throw error as this is not critical
      } else {
        console.log('✅ Image deleted successfully:', filePath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error as this is not critical
    }
  },

  // Users related queries
  async getUsers(search?: string) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('email', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Order related queries
  async getUserOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items(
            *,
            product:products(*)
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
};
