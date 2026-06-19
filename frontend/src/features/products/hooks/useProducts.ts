import { useQuery } from '@tanstack/react-query';
import { productService } from '../../../services/product.service';
import type { ProductFilters } from '../../../types/product.types';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}
