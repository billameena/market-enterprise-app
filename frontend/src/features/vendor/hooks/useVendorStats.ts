import { useQuery } from '@tanstack/react-query';
import { api } from '../../../utils/api';
import type { VendorStats } from '../../../types/vendor.types';

export function useVendorStats() {
  return useQuery({
    queryKey: ['vendor', 'stats'],
    queryFn: () =>
      api.get<VendorStats>('/vendors/me/stats').then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}
