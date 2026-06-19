import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../utils/api';
import type { Category } from '../../../types/product.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface Filters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ProductFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice?.toString() ?? '',
    max: filters.maxPrice?.toString() ?? '',
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => api.get<Category[]>('/categories/tree').then((r) => r.data),
    staleTime: 1000 * 60 * 60,
  });

  function handlePriceApply() {
    onChange({
      ...filters,
      minPrice: priceRange.min ? Number(priceRange.min) : undefined,
      maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
    });
  }

  function handleReset() {
    setPriceRange({ min: '', max: '' });
    onChange({});
  }

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="font-semibold text-surface-900 mb-3">Categories</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onChange({ ...filters, categoryId: undefined })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !filters.categoryId ? 'bg-primary-50 text-primary-700 font-medium' : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              All Categories
            </button>
          </li>
          {categories?.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onChange({ ...filters, categoryId: cat.id })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.categoryId === cat.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-surface-900 mb-3">Price Range</h3>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Min"
            type="number"
            value={priceRange.min}
            onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
          />
          <span className="text-surface-400">—</span>
          <Input
            placeholder="Max"
            type="number"
            value={priceRange.max}
            onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
          />
        </div>
        <Button size="sm" variant="outline" fullWidth className="mt-2" onClick={handlePriceApply}>
          Apply
        </Button>
      </div>

      <Button variant="ghost" size="sm" fullWidth onClick={handleReset}>
        Reset Filters
      </Button>
    </aside>
  );
}
