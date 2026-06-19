import { useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useProducts } from '../features/products/hooks/useProducts';
import { ProductGrid } from '../features/products/components/ProductGrid';
import { ProductFilters } from '../features/products/components/ProductFilters';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import type { ProductFilters as ProductFiltersType } from '../types/product.types';

interface ProductFiltersState {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  q?: string;
}

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'averageRating:desc', label: 'Best Rated' },
  { value: 'reviewCount:desc', label: 'Most Reviews' },
];

export function Products() {
  const search = useSearch({ from: '/main/products' }) as ProductFiltersState;
  const [filters, setFilters] = useState<ProductFiltersState>({
    categoryId: search.categoryId,
    q: search.q,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortValue, setSortValue] = useState('createdAt:desc');
  const { data, isLoading, isFetching } = useProducts(filters as ProductFiltersType);
  const products = data?.items ?? [];
  const total = data?.meta?.total ?? 0;

  function handleSortChange(value: string) {
    setSortValue(value);
    const [sortBy, sortOrder] = value.split(':');
    setFilters((f) => ({ ...f, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {filters.q ? `Results for "${filters.q}"` : 'All Products'}
          </h1>
          {!isLoading && (
            <p className="text-sm text-surface-500 mt-0.5">{total} products</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1.5" />
            Filters
          </Button>
          <Select
            value={sortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            options={SORT_OPTIONS}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <ProductFilters filters={filters} onChange={setFilters} />
          </div>
        </div>

        {/* Mobile filters drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-white p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-surface-900">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-surface-500 hover:text-surface-700"
                >
                  ✕
                </button>
              </div>
              <ProductFilters
                filters={filters}
                onChange={(f) => { setFilters(f); setShowMobileFilters(false); }}
              />
            </div>
          </div>
        )}

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            isLoading={isLoading || isFetching}
          />
        </div>
      </div>
    </div>
  );
}
