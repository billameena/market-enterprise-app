import { formatCurrency } from '../../../utils/format';
import type { CartSummary as CartSummaryType } from '../../../types/cart.types';

interface CartSummaryProps {
  summary: CartSummaryType;
}

export function CartSummary({ summary }: CartSummaryProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-surface-600">Subtotal ({summary.itemCount} items)</span>
        <span className="font-medium text-surface-900">{formatCurrency(summary.subtotal)}</span>
      </div>

      {summary.discountAmount > 0 && !summary.coupon && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-600">Discount</span>
          <span className="font-medium text-green-600">−{formatCurrency(summary.discountAmount)}</span>
        </div>
      )}

      {summary.coupon && summary.discountAmount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-600">
            Coupon {summary.coupon.code ? `(${summary.coupon.code})` : ''}
          </span>
          <span className="font-medium text-green-600">−{formatCurrency(summary.discountAmount)}</span>
        </div>
      )}

      {summary.shippingAmount !== null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-600">Shipping</span>
          <span className="font-medium text-surface-900">
            {summary.shippingAmount === 0 ? 'Free' : formatCurrency(summary.shippingAmount)}
          </span>
        </div>
      )}

      {summary.taxAmount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-600">Tax</span>
          <span className="font-medium text-surface-900">{formatCurrency(summary.taxAmount)}</span>
        </div>
      )}

      <div className="pt-2 border-t border-surface-200 flex items-center justify-between">
        <span className="font-bold text-surface-900">Total</span>
        <span className="text-xl font-bold text-surface-900">{formatCurrency(summary.total)}</span>
      </div>
    </div>
  );
}
