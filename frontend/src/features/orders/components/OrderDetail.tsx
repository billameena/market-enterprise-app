import { useOrder } from '../hooks/useOrder';
import { OrderStatus } from './OrderStatus';
import { Spinner } from '../../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../../utils/format';
import { MapPinIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';
import type { OrderItem } from '../../../types/order.types';

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-500">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Order #{order.orderNumber}</h1>
          <p className="text-surface-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatus status={order.status} showTimeline />
      </div>

      {/* Timeline */}
      <div className="hidden md:block">
        <OrderStatus status={order.status} showTimeline />
      </div>

      {/* Items */}
      <div className="border border-surface-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100 bg-surface-50">
          <h2 className="font-semibold text-surface-900">Items Ordered</h2>
        </div>
        <ul className="divide-y divide-surface-100">
          {order.items.map((item: OrderItem) => (
            <li key={item.id} className="px-5 py-4 flex gap-4">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-16 h-16 rounded-xl object-cover bg-surface-100 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-900">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-surface-500 mt-0.5">{item.variantName}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-surface-500">Qty: {item.quantity}</span>
                  <span className="text-sm text-surface-500">×</span>
                  <span className="text-sm text-surface-700">{formatCurrency(item.unitPrice)}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-surface-900 flex-shrink-0">
                {formatCurrency(item.totalPrice)}
              </span>
            </li>
          ))}
        </ul>

        {/* Order totals */}
        <div className="px-5 py-4 bg-surface-50 border-t border-surface-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-surface-600">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="text-green-600">−{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-surface-600">Shipping</span>
            <span>{order.shippingAmount === 0 ? 'Free' : formatCurrency(order.shippingAmount)}</span>
          </div>
          {order.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-surface-600">Tax</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-surface-200">
            <span>Total</span>
            <span className="text-primary-700">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="p-5 border border-surface-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-surface-900 text-sm">Shipping Address</h3>
            </div>
            <div className="text-sm text-surface-600 space-y-0.5">
              <p className="font-medium text-surface-900">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        )}

        {/* Payment info */}
        {order.payments?.[0] && (
          <div className="p-5 border border-surface-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-surface-900 text-sm">Payment</h3>
            </div>
            <div className="text-sm text-surface-600 space-y-1">
              <p className="font-medium text-surface-900">
                {order.payments[0].method.replace('_', ' ')}
              </p>
              <p>Status: {order.payments[0].status}</p>
              {order.payments[0].paidAt && <p>Paid: {formatDate(order.payments[0].paidAt)}</p>}
            </div>
          </div>
        )}

        {/* Shipping tracking */}
        {order.items?.[0]?.trackingNumber && (
          <div className="p-5 border border-surface-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-surface-900 text-sm">Tracking</h3>
            </div>
            <div className="text-sm text-surface-600 space-y-1">
              <p className="font-mono font-medium text-surface-900">{order.items[0].trackingNumber}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
