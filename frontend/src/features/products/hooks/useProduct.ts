import { useQuery } from '@tanstack/react-query';
import { productService } from '../../../services/product.service';

export function useProduct(slugOrId: string) {
  return useQuery({
    queryKey: ['product', slugOrId],
    queryFn: () =>
      slugOrId.includes('-')
        ? productService.getProductBySlug(slugOrId)
        : productService.getProductById(slugOrId),
    enabled: !!slugOrId,
    staleTime: 1000 * 60 * 5,
  });
}
