import { Link, useNavigate } from '@tanstack/react-router';
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../../hooks/useCart';
import { useCartStore } from '../../../store/cart.store';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { EmptyCart } from './EmptyCart';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import type { CartItem as CartItemType, CartSummary as CartSummaryType } from '../../../types/cart.types';

export function CartDrawer() {
  const { items, isLoading, itemCount } = useCart();
  const { isOpen, closeCart, subtotal, total, coupon } = useCartStore();
  const navigate = useNavigate();

  const summary: CartSummaryType = {
    items,
    subtotal,
    discountAmount: 0,
    taxAmount: 0,
    shippingAmount: 0,
    total,
    coupon,
    itemCount,
  };

  function handleCheckout() {
    closeCart();
    navigate({ to: '/checkout' });
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-surface-700" />
            <h2 className="font-bold text-surface-900">Shopping Cart</h2>
            {items.length > 0 && (
              <span className="ml-1 text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            aria-label="Close cart"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : items.length === 0 ? (
            <EmptyCart onClose={closeCart} />
          ) : (
            <div className="px-5 divide-y divide-surface-100">
              {items.map((item: CartItemType) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-surface-100 px-5 py-5 space-y-4 bg-white">
            <CartSummary summary={summary} />

            <div className="space-y-2">
              <Button fullWidth size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Link
                to="/cart"
                onClick={closeCart}
                className="inline-flex w-full items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none bg-transparent text-surface-700 hover:bg-surface-100 h-8 px-3 text-sm rounded-md"
              >
                View Full Cart
              </Link>
            </div>

            <p className="text-center text-xs text-surface-400">
              Secure checkout powered by Stripe
            </p>
          </div>
        )}
      </div>
    </>
  );
}
