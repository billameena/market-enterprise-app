import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, TagIcon, CubeIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { api } from '../../../utils/api';
import { ProductForm } from './ProductForm';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Pagination';
import { formatCurrency, formatDate } from '../../../utils/format';
import { usePagination } from '../../../hooks/usePagination';
import type { Product } from '../../../types/product.types';
import toast from 'react-hot-toast';

interface VendorProductsData {
  products: Product[];
  total: number;
  pages: number;
}

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  ACTIVE: 'success',
  DRAFT: 'default',
  PENDING_REVIEW: 'warning',
  REJECTED: 'danger',
  ARCHIVED: 'default',
};

function ProductPreview({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const images = product.images ?? [];

  return (
    <div className="space-y-5">
      {/* Images */}
      {images.length > 0 ? (
        <div className="space-y-2">
          <img
            src={images[activeImg]?.url}
            alt={product.name}
            className="w-full h-56 object-cover rounded-xl bg-surface-100"
          />
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                    i === activeImg ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-40 rounded-xl bg-surface-100 flex items-center justify-center">
          <CubeIcon className="w-12 h-12 text-surface-300" />
        </div>
      )}

      {/* Name + status */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-surface-900 leading-snug">{product.name}</h3>
        <Badge variant={STATUS_BADGE[product.status] ?? 'default'} size="sm" className="shrink-0 mt-0.5">
          {product.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-50 rounded-xl p-3 text-center">
          <p className="text-xs text-surface-500 mb-1">Price</p>
          <p className="text-sm font-bold text-surface-900">{formatCurrency(product.price)}</p>
          {product.comparePrice && (
            <p className="text-xs text-surface-400 line-through">{formatCurrency(product.comparePrice)}</p>
          )}
        </div>
        <div className="bg-surface-50 rounded-xl p-3 text-center">
          <p className="text-xs text-surface-500 mb-1">Stock</p>
          <p className="text-sm font-bold text-surface-900">{product.inventory?.quantity ?? 0}</p>
          {product.inventory?.lowStockThreshold && product.inventory.quantity <= product.inventory.lowStockThreshold && (
            <p className="text-xs text-danger-500">Low stock</p>
          )}
        </div>
        <div className="bg-surface-50 rounded-xl p-3 text-center">
          <p className="text-xs text-surface-500 mb-1">Sold</p>
          <p className="text-sm font-bold text-surface-900">{product.totalSold ?? 0}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-surface-600">
          <TagIcon className="w-4 h-4 shrink-0 text-surface-400" />
          <span className="text-surface-500">Category:</span>
          <span className="font-medium text-surface-800">{product.category?.name ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-surface-600">
          <ArchiveBoxIcon className="w-4 h-4 shrink-0 text-surface-400" />
          <span className="text-surface-500">SKU:</span>
          <span className="font-medium font-mono text-surface-800">{product.sku}</span>
        </div>
        <div className="flex items-center gap-2 text-surface-600">
          <span className="text-surface-500">Added:</span>
          <span className="font-medium text-surface-800">{formatDate(product.createdAt)}</span>
        </div>
        {product.averageRating > 0 && (
          <div className="flex items-center gap-2 text-surface-600">
            <span className="text-surface-500">Rating:</span>
            <span className="font-medium text-surface-800">
              ★ {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Description</p>
          <p className="text-sm text-surface-700 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Variants</p>
          <div className="space-y-1.5">
            {product.variants.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm px-3 py-2 bg-surface-50 rounded-lg">
                <span className="text-surface-700">{v.name}</span>
                <div className="flex items-center gap-3 text-surface-500">
                  <span>{formatCurrency(v.price)}</span>
                  <span>Qty: {v.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function VendorProducts() {
  const queryClient = useQueryClient();
  const { page, setPage, pageSize } = usePagination();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'products', page],
    queryFn: () =>
      api
        .get<VendorProductsData>('/vendors/me/products', { params: { page, limit: pageSize } })
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] });
      setDeletingId(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border border-surface-200 rounded-xl">
            <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-500">{data?.total ?? 0} products</p>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="w-4 h-4 mr-1.5" />
          Add Product
        </Button>
      </div>

      <div className="border border-surface-200 rounded-2xl overflow-auto max-h-[calc(100vh-300px)]">
        <table className="w-full">
          <thead className="bg-surface-50 border-b border-surface-100 sticky top-0 z-10">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Product</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Price</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Stock</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {data?.products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <p className="text-sm font-medium text-surface-600 mb-1">No products yet</p>
                  <p className="text-xs text-surface-400">Add your first product — it will be reviewed by an admin before going live.</p>
                </td>
              </tr>
            )}
            {data?.products.map((product) => (
              <tr key={product.id} className="hover:bg-surface-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-surface-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-surface-100 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-surface-900">{product.name}</p>
                      <p className="text-xs text-surface-400 font-mono">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-surface-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-5 py-4 text-sm text-surface-600">
                  {product.inventory?.quantity ?? 0}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={STATUS_BADGE[product.status] ?? 'default'} size="sm">
                    {product.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setViewingProduct(product)}
                      className="p-1.5 text-surface-400 hover:text-surface-700 transition-colors rounded-lg hover:bg-surface-100"
                      aria-label="Preview product"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-1.5 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-surface-100"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(product.id)}
                      className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors rounded-lg hover:bg-surface-100"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pages && data.pages > 1 && (
        <Pagination
          meta={{ page, totalPages: data.pages, total: data.total ?? 0, pageSize, hasNextPage: page < data.pages, hasPreviousPage: page > 1 }}
          onPageChange={setPage}
        />
      )}

      {/* Preview modal */}
      <Modal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        title="Product Preview"
        size="md"
      >
        {viewingProduct && <ProductPreview product={viewingProduct} />}
      </Modal>

      {/* Create modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Product"
        size="lg"
      >
        <ProductForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        size="lg"
      >
        {editingProduct && (
          <ProductForm
            productId={editingProduct.id}
            initialValues={{
              name: editingProduct.name,
              description: editingProduct.description ?? '',
              price: editingProduct.price,
              compareAtPrice: editingProduct.comparePrice ?? undefined,
              categoryId: editingProduct.category?.id ?? '',
              sku: editingProduct.sku,
              inventory: editingProduct.inventory?.quantity ?? 0,
            }}
            onSuccess={() => setEditingProduct(null)}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 text-sm">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
            >
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
