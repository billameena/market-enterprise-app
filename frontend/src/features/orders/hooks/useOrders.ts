import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../../services/order.service';
import { usePagination } from '../../../hooks/usePagination';

interface UseOrdersOptions {
  status?: string;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const { page, setPage } = usePagination();

  const query = useQuery({
    queryKey: ['orders', { page, ...options }],
    queryFn: () =>
      orderService.getOrders(page, options.status),
  });

  return {
    ...query,
    page,
    setPage,
    orders: query.data?.items ?? [],
    totalPages: query.data?.meta?.totalPages ?? 1,
    total: query.data?.meta?.total ?? 0,
  };
}
