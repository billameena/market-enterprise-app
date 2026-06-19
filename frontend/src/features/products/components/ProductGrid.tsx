import { ProductCard } from '../../../components/shared/ProductCard';
import { SkeletonCard } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Package } from 'lucide-react';
import type { Product } from '../../../types/product.types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search or filters',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-8 h-8" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
