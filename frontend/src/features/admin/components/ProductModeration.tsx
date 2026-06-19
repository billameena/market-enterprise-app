import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { api } from '../../../utils/api';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Pagination';
import { formatCurrency, formatDate } from '../../../utils/format';
import { usePagination } from '../../../hooks/usePagination';
import type { Product } from '../../../types/product.types';
import toast from 'react-hot-toast';

export function ProductModeration() {
  const queryClient = useQueryClient();
  const { page, setPage, pageSize } = usePagination();
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [rejectingProduct, setRejectingProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, statusFilter],
    queryFn: () =>
      api
        .get<Product[]>('/products/admin', {
          params: { page, limit: pageSize, status: statusFilter || undefined },
        })
        .then((r) => ({
          products: r.data,
          total: r.meta?.total ?? 0,
          pages: r.meta?.totalPages ?? 0,
        })),
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      productId,
      action,
      reason,
    }: {
      productId: string;
      action: string;
      reason?: string;
    }) => api.patch(`/products/${productId}/moderate`, { action, reason }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Product moderated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setRejectingProduct(null);
    },
    onError: () => toast.error('Failed to moderate product'),
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['PENDING_REVIEW', 'ACTIVE', 'REJECTED', ''].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border border-surface-200 rounded-xl">
              <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-surface-200 rounded-2xl overflow-auto max-h-[calc(100vh-300px)]">
          <table className="w-full min-w-[640px]">
            <thead className="bg-surface-50 border-b border-surface-100 sticky top-0 z-10">
              <tr>
                {['Product', 'Vendor', 'Price', 'Status', 'Submitted', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
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
                        <p className="text-xs text-surface-400">{product.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-700">
                    {product.store?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-surface-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        product.status === 'ACTIVE'
                          ? 'success'
                          : product.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {product.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-500">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {product.status === 'PENDING_REVIEW' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            moderateMutation.mutate({ productId: product.id, action: 'APPROVE' })
                          }
                          className="p-1.5 text-surface-400 hover:text-green-600 transition-colors rounded-lg hover:bg-surface-100"
                          aria-label="Approve"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRejectingProduct(product);
                            setRejectReason('');
                          }}
                          className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors rounded-lg hover:bg-surface-100"
                          aria-label="Reject"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.pages && data.pages > 1 && (
        <Pagination
          meta={{ page, totalPages: data.pages, hasNextPage: page < data.pages, hasPreviousPage: page > 1, total: data.total, pageSize }}
          onPageChange={setPage}
        />
      )}

      {/* Reject modal */}
      <Modal
        isOpen={Boolean(rejectingProduct)}
        onClose={() => setRejectingProduct(null)}
        title="Reject Product"
        size="sm"
      >
        {rejectingProduct && (
          <div className="space-y-4">
            <p className="text-sm text-surface-600">
              Rejecting: <strong>{rejectingProduct.name}</strong>
            </p>
            <div>
              <label className="text-sm font-medium text-surface-700 block mb-1.5">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Explain why this product is being rejected..."
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="danger"
                isLoading={moderateMutation.isPending}
                onClick={() =>
                  moderateMutation.mutate({
                    productId: rejectingProduct.id,
                    action: 'REJECT',
                    reason: rejectReason,
                  })
                }
              >
                Reject Product
              </Button>
              <Button variant="ghost" onClick={() => setRejectingProduct(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
