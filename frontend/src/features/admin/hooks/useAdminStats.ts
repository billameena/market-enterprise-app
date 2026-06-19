import { useQuery } from '@tanstack/react-query';
import { api } from '../../../utils/api';

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalOrders: number;
  totalRevenue: number;
  gmv: number;
  pendingVendors: number;
  pendingProducts: number;
  activeProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  revenueTimeSeries: Array<{ date: string; revenue: number; orders: number }>;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () =>
      api.get<AdminStats>('/analytics/admin').then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}
