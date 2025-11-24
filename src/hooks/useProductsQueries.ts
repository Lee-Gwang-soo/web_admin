import { Product, supabaseApi } from '@/lib/supabase';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

// Query Keys
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: { search?: string; category?: string }) =>
    [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  categories: () => [...productsKeys.all, 'categories'] as const,
  kpi: () => [...productsKeys.all, 'kpi'] as const,
};

/**
 * 상품 목록 조회 hook
 */
export function useProducts(
  search?: string,
  category?: string,
  options?: Omit<UseQueryOptions<Product[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productsKeys.list({ search, category }),
    queryFn: () => supabaseApi.getProducts(search, category),
    staleTime: 2 * 60 * 1000, // 2분 - 상품 데이터는 자주 변하지 않으므로
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 상품 카테고리 목록 조회 hook
 */
export function useProductCategories(
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productsKeys.categories(),
    queryFn: () => supabaseApi.getProductCategories(),
    staleTime: 5 * 60 * 1000, // 5분 - 카테고리는 거의 변하지 않음
    gcTime: 30 * 60 * 1000, // 30분
    ...options,
  });
}

/**
 * 상품 KPI 조회 hook
 */
export function useProductKPI(
  options?: Omit<
    UseQueryOptions<
      {
        totalProducts: number;
        totalStockValue: number;
        lowStockProducts: number;
        outOfStockProducts: number;
      },
      Error
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: productsKeys.kpi(),
    queryFn: () => supabaseApi.getProductKPI(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * 상품 추가 mutation hook
 * - 낙관적 업데이트 적용
 * - 성공 시 캐시 무효화
 */
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
    ) => supabaseApi.addProduct(productData),
    onSuccess: (newProduct) => {
      // 상품 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      // 카테고리 목록 캐시 무효화 (새 카테고리가 추가될 수 있음)
      queryClient.invalidateQueries({ queryKey: productsKeys.categories() });
      // KPI 캐시 무효화
      queryClient.invalidateQueries({ queryKey: productsKeys.kpi() });

      console.log('✅ Product added successfully:', newProduct);
    },
    onError: (error) => {
      console.error('❌ Error adding product:', error);
    },
  });
}

/**
 * 상품 수정 mutation hook
 * - 낙관적 업데이트 적용
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Product) => supabaseApi.updateProduct(product),
    onMutate: async (updatedProduct) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: productsKeys.lists() });

      // 이전 데이터 백업
      const previousProducts = queryClient.getQueriesData({
        queryKey: productsKeys.lists(),
      });

      // 낙관적 업데이트
      queryClient.setQueriesData<Product[]>(
        { queryKey: productsKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          );
        }
      );

      return { previousProducts };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('❌ Error updating product:', error);
    },
    onSuccess: (updatedProduct) => {
      // 성공 시 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.kpi() });

      console.log('✅ Product updated successfully:', updatedProduct);
    },
  });
}

/**
 * 상품 삭제 mutation hook
 * - 낙관적 업데이트 적용
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => supabaseApi.deleteProduct(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: productsKeys.lists() });

      const previousProducts = queryClient.getQueriesData({
        queryKey: productsKeys.lists(),
      });

      // 낙관적 업데이트 - UI에서 즉시 제거
      queryClient.setQueriesData<Product[]>(
        { queryKey: productsKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.filter((p) => p.id !== productId);
        }
      );

      return { previousProducts };
    },
    onError: (error, variables, context) => {
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('❌ Error deleting product:', error);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.kpi() });

      console.log('✅ Product deleted successfully:', productId);
    },
  });
}

/**
 * 상품 대량 삭제 mutation hook
 */
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productIds: string[]) => {
      // 각 상품을 순차적으로 삭제
      await Promise.all(productIds.map((id) => supabaseApi.deleteProduct(id)));
    },
    onMutate: async (productIds) => {
      await queryClient.cancelQueries({ queryKey: productsKeys.lists() });

      const previousProducts = queryClient.getQueriesData({
        queryKey: productsKeys.lists(),
      });

      // 낙관적 업데이트
      queryClient.setQueriesData<Product[]>(
        { queryKey: productsKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.filter((p) => !productIds.includes(p.id));
        }
      );

      return { previousProducts };
    },
    onError: (error, variables, context) => {
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('❌ Error bulk deleting products:', error);
    },
    onSuccess: (_, productIds) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.kpi() });

      console.log('✅ Bulk delete completed successfully');
    },
  });
}

/**
 * 상품 이미지 업로드 mutation hook
 */
export function useUploadProductImage() {
  return useMutation({
    mutationFn: (file: File) => supabaseApi.uploadProductImage(file),
    onError: (error) => {
      console.error('❌ Error uploading image:', error);
    },
    onSuccess: (imageUrl) => {
      console.log('✅ Image uploaded successfully:', imageUrl);
    },
  });
}

/**
 * 상품 이미지 삭제 mutation hook
 */
export function useDeleteProductImage() {
  return useMutation({
    mutationFn: (imageUrl: string) => supabaseApi.deleteProductImage(imageUrl),
    onError: (error) => {
      console.error('❌ Error deleting image:', error);
    },
    onSuccess: () => {
      console.log('✅ Image deleted successfully');
    },
  });
}
