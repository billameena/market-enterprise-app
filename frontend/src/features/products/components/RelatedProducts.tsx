import { useQuery } from '@tanstack/react-query';
import { api } from '../../../utils/api';
import { ProductCard } from '../../../components/shared/ProductCard';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { Product } from '../../../types/product.types';

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
}

export function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['related-products', productId],
    queryFn: () =>
      api
        .get<{ products: Product[] }>('/products', {
          params: { categoryId, limit: 4, exclude: productId },
        })
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-surface-900 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const products = data?.products.filter((p) => p.id !== productId).slice(0, 4) ?? [];

  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
