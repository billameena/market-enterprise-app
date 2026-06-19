import { TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../utils/format';
import { Spinner } from '../../../components/ui/Spinner';
import type { CartItem as CartItemType } from '../../../types/cart.types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateItem, removeItem, isRemoving } = useCart();

  const isLoading = isRemoving;
  const totalPrice = item.price * item.quantity;

  return (
    <div className={`flex gap-3 py-4 transition-opacity ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Image */}
      <div className="flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-20 h-20 rounded-xl object-cover bg-surface-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-surface-100" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-surface-900 line-clamp-2">
          {item.productName}
        </p>

        {item.variantName && (
          <p className="text-xs text-surface-500 mt-0.5">
            {item.variantName}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Quantity controls */}
          <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden">
            <button
              onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-colors text-sm disabled:opacity-40"
            >
              −
            </button>
            <span className="w-8 h-7 flex items-center justify-center text-xs font-semibold text-surface-900 border-x border-surface-200">
              {isLoading ? <Spinner size="sm" /> : item.quantity}
            </span>
            <button
              onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
              className="w-7 h-7 flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-colors text-sm"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-surface-900">{formatCurrency(totalPrice)}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1 text-surface-400 hover:text-danger-500 transition-colors"
              aria-label="Remove item"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
