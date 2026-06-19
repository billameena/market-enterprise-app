import { useNavigate } from '@tanstack/react-router';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart';
import { useCartStore } from '../store/cart.store';
import { CartItem } from '../features/cart/components/CartItem';
import { CartSummary } from '../features/cart/components/CartSummary';
import { CouponInput } from '../features/checkout/components/CouponInput';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import type { CartSummary as CartSummaryType, CartItem as CartItemType } from '../types/cart.types';

export function Cart() {
  const { items, isLoading } = useCart();
  const { subtotal, total, coupon, itemCount } = useCartStore();
  const navigate = useNavigate();

  const summary: CartSummaryType = {
    items,
    subtotal,
    discountAmount: coupon ? 0 : 0,
    taxAmount: 0,
    shippingAmount: 0,
    total,
    coupon,
    itemCount,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBagIcon className="w-10 h-10 text-surface-400" />
        </div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">Your cart is empty</h2>
        <p className="text-surface-500 mb-6">Add items to get started.</p>
        <Button onClick={() => navigate({ to: '/products', search: { q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined } })}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Shopping Cart ({items.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Items */}
        <div className="divide-y divide-surface-100 border border-surface-200 rounded-2xl px-5">
          {items.map((item: CartItemType) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="p-5 border border-surface-200 rounded-2xl space-y-4">
            <h2 className="font-bold text-surface-900">Order Summary</h2>
            <CouponInput appliedCoupon={coupon?.code} summary={summary} />
            <CartSummary summary={summary} />
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Proceed to Checkout
            </Button>
          </div>
          <p className="text-xs text-center text-surface-400">
            Prices include applicable taxes and fees
          </p>
        </div>
      </div>
    </div>
  );
}
