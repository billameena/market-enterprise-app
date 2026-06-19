import { Link, useNavigate } from '@tanstack/react-router';
import { useOrders } from '../hooks/useOrders';
import { OrderStatus } from './OrderStatus';
import { Pagination } from '../../../components/ui/Pagination';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../../../utils/format';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

interface OrderListProps {
  statusFilter?: string;
}

export function OrderList({ statusFilter }: OrderListProps) {
  const navigate = useNavigate();
  const { orders, isLoading, page, setPage, totalPages, total } = useOrders({ status: statusFilter });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 border border-surface-200 rounded-xl space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBagIcon className="w-8 h-8" />}
        title="No orders yet"
        description="When you place an order, it will appear here."
        action={{ label: 'Start Shopping', onClick: () => navigate({ to: '/products', search: { q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined } }) }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-surface-500">{total} order{total !== 1 ? 's' : ''}</p>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to="/orders/$orderId"
            params={{ orderId: order.id }}
            className="block p-5 border border-surface-200 rounded-xl hover:border-primary-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-surface-900">Order #{order.orderNumber}</p>
                <p className="text-xs text-surface-500 mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <OrderStatus status={order.status} />
            </div>

            <div className="mt-3 flex items-center gap-4 flex-wrap">
              <span className="text-sm text-surface-600">
                {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
              </span>
              <span className="text-sm font-bold text-surface-900">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>

            {/* Thumbnail strip */}
            {order.items && order.items.some((i) => i.imageUrl) && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {order.items.filter((i) => i.imageUrl).slice(0, 5).map((item, i) => (
                  <img
                    key={i}
                    src={item.imageUrl!}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-surface-100 flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          meta={{ page, totalPages, total, pageSize: 10, hasNextPage: page < totalPages, hasPreviousPage: page > 1 }}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
