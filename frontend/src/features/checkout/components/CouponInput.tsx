import { useState } from 'react';
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCartMutations } from '../../cart/hooks/useCartMutations';
import { Button } from '../../../components/ui/Button';
import type { CartSummary } from '../../../types/cart.types';

interface CouponInputProps {
  appliedCoupon?: string | null;
  summary: CartSummary;
}

export function CouponInput({ appliedCoupon, summary }: CouponInputProps) {
  const [code, setCode] = useState('');
  const { applyCouponMutation, removeCouponMutation } = useCartMutations();

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    applyCouponMutation.mutate(code.trim().toUpperCase(), {
      onSuccess: () => setCode(''),
    });
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700">{appliedCoupon}</span>
          {summary.discountAmount > 0 && (
            <span className="text-xs text-green-600">
              −${summary.discountAmount.toFixed(2)} saved
            </span>
          )}
        </div>
        <button
          onClick={() => removeCouponMutation.mutate()}
          disabled={removeCouponMutation.isPending}
          className="text-green-600 hover:text-green-800 transition-colors"
          aria-label="Remove coupon"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex gap-2">
      <div className="relative flex-1">
        <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="w-full pl-9 pr-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase tracking-wider"
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        isLoading={applyCouponMutation.isPending}
        disabled={!code.trim()}
      >
        Apply
      </Button>
    </form>
  );
}
