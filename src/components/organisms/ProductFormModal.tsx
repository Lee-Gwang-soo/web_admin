'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/lib/supabase';
import { useTranslation } from '@/store/i18n-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { memo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().min(0, 'Stock must be positive'),
  category: z.string().min(1, 'Category is required'),
  image_url: z.string().url().optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: string[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading?: boolean;
}

export const ProductFormModal = memo<ProductFormModalProps>(
  function ProductFormModal({
    open,
    onOpenChange,
    product,
    categories,
    onSubmit,
    loading = false,
  }) {
    const { t } = useTranslation();
    const isEdit = !!product;

    const form = useForm<ProductFormData>({
      resolver: zodResolver(productFormSchema),
      defaultValues: {
        name: '',
        price: 0,
        stock: 0,
        category: '',
        image_url: '',
      },
    });

    // Reset form when modal opens/closes or product changes
    useEffect(() => {
      if (open && product) {
        form.reset({
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          image_url: product.images?.[0] || product.image_url || '',
        });
      } else if (open && !product) {
        form.reset({
          name: '',
          price: 0,
          stock: 0,
          category: '',
          image_url: '',
        });
      }
    }, [open, product, form]);

    const handleSubmit = useCallback(
      async (data: ProductFormData) => {
        try {
          await onSubmit(data);
          onOpenChange(false);
          form.reset();
        } catch (error) {
          console.error('Error submitting product form:', error);
        }
      },
      [onSubmit, onOpenChange, form]
    );

    const handleClose = useCallback(() => {
      onOpenChange(false);
      form.reset();
    }, [onOpenChange, form]);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEdit
                ? t('products.modal.editTitle')
                : t('products.modal.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t('products.modal.editDescription')
                : t('products.modal.addDescription')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.form.name')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('products.form.namePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.form.category')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                'products.form.categoryPlaceholder'
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories
                            .filter((cat) => cat !== 'all')
                            .map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.form.price')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock */}
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.form.stock')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image URL */}
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('products.form.imageUrl')}</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder={t('products.form.imageUrlPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isEdit ? t('common.update') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);
