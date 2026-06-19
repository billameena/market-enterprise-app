import { Link } from '@tanstack/react-router';
import { ShoppingCart, Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/format';
import { useCart } from '../../hooks/useCart';
import type { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, isAdding } = useCart();
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const isOutOfStock =
    product.inventory ? product.inventory.quantity - product.inventory.reservedQuantity <= 0 : false;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <div
      className={cn(
        'group bg-white rounded-xl border border-surface-200 overflow-hidden',
        'transition-shadow duration-200 hover:shadow-card-hover',
        className,
      )}
    >
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block relative overflow-hidden">
        <div className="aspect-square bg-surface-100">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-400">
              No image
            </div>
          )}
        </div>
        {discount && (
          <Badge variant="danger" className="absolute top-2 left-2">
            -{discount}%
          </Badge>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <Badge variant="default">Out of Stock</Badge>
          </div>
        )}
      </Link>

      <div className="p-4">
        <p className="text-xs text-surface-500 mb-1 truncate">{product.store.name}</p>
        <Link to="/products/$slug" params={{ slug: product.slug }}>
          <h3 className="font-medium text-surface-900 line-clamp-2 mb-2 hover:text-primary-600 transition-colors text-sm">
            {product.name}
          </h3>
        </Link>

        {product.totalReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
            <span className="text-xs font-medium text-surface-700">{product.averageRating.toFixed(1)}</span>
            <span className="text-xs text-surface-400">({product.totalReviews})</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-bold text-surface-900">{formatCurrency(product.price)}</span>
            {product.comparePrice && (
              <span className="ml-2 text-xs text-surface-400 line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="primary"
            disabled={isOutOfStock}
            isLoading={isAdding}
            onClick={() => addItem({ productId: product.id, quantity: 1 })}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
