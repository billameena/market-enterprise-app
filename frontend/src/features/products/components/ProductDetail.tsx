import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import {
  HeartIcon,
  ShareIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import { ProductImages } from './ProductImages';
import { ProductVariants } from './ProductVariants';
import { ProductReviews } from './ProductReviews';
import { RelatedProducts } from './RelatedProducts';
import { useCart } from '../../../hooks/useCart';
import { useAuth } from '../../../hooks/useAuth';
import { formatCurrency } from '../../../utils/format';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { api } from '../../../utils/api';
import type { Product, ProductVariant } from '../../../types/product.types';
import toast from 'react-hot-toast';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { isAuthenticated } = useAuth();
  const { addItem, isAdding } = useCart();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find((v) => {
        const variantOptions: Record<string, string> = {};
        for (const attr of v.attributeValues) {
          variantOptions[attr.attribute.name] = attr.value;
        }
        return Object.entries(selectedOptions).every(([k, val]) => variantOptions[k] === val);
      }) ?? null
    );
  }, [product.variants, selectedOptions]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const comparePrice = product.comparePrice;
  const discount = comparePrice && comparePrice > displayPrice
    ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100)
    : null;

  const inventoryCount = selectedVariant?.stock ?? product.inventory?.quantity ?? 0;
  const inStock = inventoryCount > 0;

  const wishlistMutation = useMutation({
    mutationFn: () =>
      isWishlisted
        ? api.delete(`/wishlist/${product.id}`).then((r) => r.data)
        : api.post('/wishlist', { productId: product.id }).then((r) => r.data),
    onSuccess: () => {
      setIsWishlisted((prev) => !prev);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    },
    onError: () => toast.error('Failed to update wishlist'),
  });

  function handleOptionChange(attributeName: string, value: string) {
    setSelectedOptions((prev) => ({ ...prev, [attributeName]: value }));
  }

  function handleAddToCart() {
    if (!inStock) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
    });
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  }

  return (
    <div className="space-y-16">
      {/* Product main section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Images */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ProductImages images={(product.images ?? []) as any} productName={product.name} />

        {/* Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          {product.category && (
            <nav className="flex items-center gap-2 text-sm text-surface-500">
              <Link to="/products" search={{ q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }} className="hover:text-primary-600 transition-colors">Products</Link>
              <span>/</span>
              <Link
                to="/products"
                search={{ q: undefined, categoryId: product.category.id, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }}
                className="hover:text-primary-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </nav>
          )}

          {/* Title & badges */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-surface-900 leading-tight">{product.name}</h1>
              <div className="flex gap-2 flex-shrink-0 mt-1">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
                  aria-label="Share"
                >
                  <ShareIcon className="w-5 h-5 text-surface-500" />
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => wishlistMutation.mutate()}
                    disabled={wishlistMutation.isPending}
                    className="p-2 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isWishlisted ? (
                      <HeartSolid className="w-5 h-5 text-danger-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-surface-500" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Seller & rating */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {product.store && (
                <span className="text-sm text-primary-600 font-medium">
                  {product.store.name}
                </span>
              )}
              {product.totalReviews > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-surface-700">{product.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-surface-500">({product.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-surface-900">{formatCurrency(displayPrice)}</span>
            {comparePrice && comparePrice > displayPrice && (
              <>
                <span className="text-lg text-surface-400 line-through">{formatCurrency(comparePrice)}</span>
                <Badge variant="danger" size="md">{discount}% OFF</Badge>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <ProductVariants
              variants={product.variants}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
              selectedVariant={selectedVariant}
            />
          )}

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-danger-500'}`} />
            <span className={`text-sm font-medium ${inStock ? 'text-green-700' : 'text-danger-700'}`}>
              {inStock
                ? inventoryCount <= 5
                  ? `Only ${inventoryCount} left`
                  : 'In Stock'
                : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-colors font-medium"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-surface-900 border-x border-surface-200">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(inventoryCount, q + 1))}
                className="w-10 h-10 flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-colors font-medium"
                disabled={quantity >= inventoryCount}
              >
                +
              </button>
            </div>
            <Button
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              disabled={!inStock}
              isLoading={isAdding}
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: TruckIcon, label: 'Free Shipping', sub: 'Orders over $50' },
              { icon: ArrowPathIcon, label: 'Easy Returns', sub: '30-day policy' },
              { icon: ShieldCheckIcon, label: 'Secure Payment', sub: '256-bit SSL' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center p-3 bg-surface-50 rounded-xl">
                <Icon className="w-5 h-5 text-primary-600 mb-1" />
                <span className="text-xs font-semibold text-surface-800">{label}</span>
                <span className="text-xs text-surface-500">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-surface-200 mb-6">
          {(['description', 'specs', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-surface-600 hover:text-surface-900'
              }`}
            >
              {tab === 'reviews' ? `Reviews (${product.totalReviews})` : tab}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div
            className="prose prose-surface max-w-none text-surface-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description ?? '<p>No description available.</p>' }}
          />
        )}

        {activeTab === 'specs' && (
          <div className="space-y-2">
            <p className="text-surface-500 text-sm">No specifications available.</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviews
            productId={product.id}
            averageRating={product.averageRating}
            reviewCount={product.totalReviews}
          />
        )}
      </div>

      {/* Related products */}
      {product.category && (
        <RelatedProducts productId={product.id} categoryId={product.category.id} />
      )}
    </div>
  );
}
