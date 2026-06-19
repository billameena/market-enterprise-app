import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import type { Category } from '../../types/product.types';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../utils/cn';

interface CategoryNavProps {
  activeId?: string;
  className?: string;
}

export function CategoryNav({ activeId, className }: CategoryNavProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => api.get<Category[]>('/categories/tree').then((r) => r.data),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className={cn('flex gap-3 overflow-x-auto scrollbar-hide', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <nav
      aria-label="Category navigation"
      className={cn('flex gap-2 overflow-x-auto scrollbar-hide pb-1', className)}
    >
      <Link
        to="/products"
        search={{ q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }}
        className={cn(
          'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
          !activeId
            ? 'bg-primary-600 text-white'
            : 'bg-surface-100 text-surface-700 hover:bg-surface-200',
        )}
      >
        All Products
      </Link>
      {categories?.map((cat) => (
        <Link
          key={cat.id}
          to="/products"
          search={{ q: undefined, categoryId: cat.id, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            cat.id === activeId
              ? 'bg-primary-600 text-white'
              : 'bg-surface-100 text-surface-700 hover:bg-surface-200',
          )}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
