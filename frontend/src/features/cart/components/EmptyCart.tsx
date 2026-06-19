import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/ui/Button';

interface EmptyCartProps {
  onClose?: () => void;
}

export function EmptyCart({ onClose }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mb-4">
        <ShoppingBagIcon className="w-10 h-10 text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-2">Your cart is empty</h3>
      <p className="text-sm text-surface-500 mb-6 max-w-[200px]">
        Looks like you haven't added anything to your cart yet.
      </p>
      <Button variant="outline" onClick={onClose}>
        <a href="/products">Start Shopping</a>
      </Button>
    </div>
  );
}
