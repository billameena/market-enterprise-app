import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useOrder } from '../features/orders/hooks/useOrder';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/format';

export function OrderSuccess() {
  const navigate = useNavigate();
  const { orderId } = useSearch({ from: '/main/order-success' }) as { orderId: string };
  const { data: order } = useOrder(orderId);

  return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircleIcon className="w-12 h-12 text-green-500" />
      </div>

      <div>
        <h1 className="text-3xl font-black text-surface-900 mb-2">Order Confirmed!</h1>
        <p className="text-surface-500">
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
      </div>

      {order && (
        <div className="p-5 bg-surface-50 border border-surface-200 rounded-2xl text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Order Number</span>
            <span className="font-mono font-bold text-surface-900">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Items</span>
            <span className="font-medium text-surface-900">{order.items?.length ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-surface-100 pt-3">
            <span className="font-bold text-surface-900">Total Paid</span>
            <span className="font-bold text-primary-700">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={() => navigate({ to: '/orders/$orderId', params: { orderId } })}>
          Track Order
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/products', search: { q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined } })}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
