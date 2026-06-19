import { formatCurrency } from '../../../utils/format';
import { CouponInput } from './CouponInput';
import type { CartItem, CartSummary as CartSummaryType } from '../../../types/cart.types';

interface OrderSummaryProps {
  items: CartItem[];
  summary: CartSummaryType;
  couponCode?: string | null;
}

export function OrderSummary({ items, summary, couponCode }: OrderSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Items */}
      <div>
        <h3 className="text-sm font-semibold text-surface-700 mb-3">
          Order Items ({items.length})
        </h3>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative flex-shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-14 h-14 rounded-lg object-cover bg-surface-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-surface-100" />
                )}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-surface-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 line-clamp-1">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-surface-500 mt-0.5">
                    {item.variantName}
                  </p>
                )}
              </div>
              <span className="text-sm font-semibold text-surface-900 flex-shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Coupon */}
      <CouponInput appliedCoupon={couponCode} summary={summary} />

      {/* Totals */}
      <div className="space-y-2 pt-4 border-t border-surface-100">
        <div className="flex justify-between text-sm">
          <span className="text-surface-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
        </div>
        {summary.discountAmount > 0 && !summary.coupon && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="font-medium text-green-600">−{formatCurrency(summary.discountAmount)}</span>
          </div>
        )}
        {summary.coupon && summary.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Coupon ({couponCode})</span>
            <span className="font-medium text-green-600">−{formatCurrency(summary.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-surface-600">Shipping</span>
          <span className="font-medium">
            {summary.shippingAmount === 0 ? 'Free' : summary.shippingAmount ? formatCurrency(summary.shippingAmount) : 'Calculated at next step'}
          </span>
        </div>
        {summary.taxAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-surface-600">Tax</span>
            <span className="font-medium">{formatCurrency(summary.taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-surface-200">
          <span>Total</span>
          <span className="text-primary-700">{formatCurrency(summary.total)}</span>
        </div>
      </div>

      <p className="text-xs text-center text-surface-400">
        Secure 256-bit SSL encrypted payment
      </p>
    </div>
  );
}
