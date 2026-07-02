import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { api } from '../../../utils/api';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { formatCurrency, formatDate } from '../../../utils/format';
import { useDebounce } from '../../../hooks/useDebounce';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  totalAmount: string | number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  items: Array<{ id: string }>;
}

const STATUS_BADGE: Record<OrderStatus, 'warning' | 'primary' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'default',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'default',
};

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

export function AdminOrderManagement() {
  const { page, setPage, pageSize } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter, debouncedSearch],
    queryFn: () =>
      api
        .get<AdminOrder[]>('/orders', {
          params: { page, limit: pageSize, status: statusFilter || undefined, search: debouncedSearch || undefined },
        })
        .then((r) => ({ orders: r.data, total: r.meta?.total ?? 0, pages: r.meta?.totalPages ?? 0 })),
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or email..."
            className="w-full pl-9 pr-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              statusFilter === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-surface-600 border-surface-200 hover:border-primary-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 border border-surface-200 rounded-xl">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="border border-surface-200 rounded-2xl overflow-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-surface-50 border-b border-surface-100 sticky top-0 z-10">
                <tr>
                  {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {data?.orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-surface-400 text-sm">
                      No orders found
                    </td>
                  </tr>
                )}
                {data?.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-semibold text-surface-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-surface-900">
                        {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-xs text-surface-500">{order.user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-surface-700">{order.items.length}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-surface-900">
                      {formatCurrency(Number(order.totalAmount))}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'FAILED' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_BADGE[order.status] ?? 'default'} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-surface-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(data?.pages ?? 0) > 1 && (
            <Pagination
              meta={{ page, totalPages: data!.pages, hasNextPage: page < data!.pages, hasPreviousPage: page > 1, total: data!.total, pageSize }}
              onPageChange={setPage}
            />
          )}

          <p className="text-xs text-surface-400 text-right">
            {data?.total ?? 0} total orders
          </p>
        </>
      )}
    </div>
  );
}
