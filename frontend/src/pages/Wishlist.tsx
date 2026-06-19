import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from '@tanstack/react-router';
import { api } from '../utils/api';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency } from '../utils/format';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/product.types';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export function Wishlist() {
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () =>
      api.get<{ items: WishlistItem[] }>('/wishlist').then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">
        Wishlist
        {items.length > 0 && (
          <span className="ml-2 text-lg text-surface-400">({items.length})</span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-10 h-10 text-surface-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-2">Your wishlist is empty</h2>
          <p className="text-surface-500 mb-6">Save items you love for later.</p>
          <Button onClick={() => navigate({ to: '/products', search: { q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined } })}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <button
                onClick={() => removeMutation.mutate(item.product.id)}
                className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-danger-500"
                aria-label="Remove from wishlist"
              >
                <TrashIcon className="w-4 h-4" />
              </button>

              <Link to="/products/$slug" params={{ slug: item.product.slug }}>
                <div className="aspect-square rounded-2xl overflow-hidden bg-surface-100 mb-3">
                  <img
                    src={item.product.images?.[0]?.url ?? ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-sm font-semibold text-surface-900 line-clamp-2">{item.product.name}</p>
                <p className="text-sm font-bold text-primary-700 mt-1">{formatCurrency(item.product.price)}</p>
              </Link>

              <Button
                size="sm"
                variant="outline"
                fullWidth
                className="mt-2"
                onClick={() => addItem({ productId: item.product.id, quantity: 1 })}
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
