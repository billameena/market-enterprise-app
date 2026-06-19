import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { api } from '../../../utils/api';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Pagination';
import { formatDate } from '../../../utils/format';
import { usePagination } from '../../../hooks/usePagination';
import type { Vendor } from '../../../types/vendor.types';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
};

export function VendorApproval() {
  const queryClient = useQueryClient();
  const { page, setPage, pageSize } = usePagination();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'vendors', page, statusFilter],
    queryFn: () =>
      api
        .get<Vendor[]>('/vendors/admin', {
          params: { page, limit: pageSize, status: statusFilter || undefined },
        })
        .then((r) => ({
          vendors: r.data,
          total: r.meta?.total ?? 0,
          pages: r.meta?.totalPages ?? 0,
        })),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ vendorId, action, reason }: { vendorId: string; action: string; reason?: string }) =>
      api.patch(`/vendors/${vendorId}/moderate`, { action, reason }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Vendor status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setViewingVendor(null);
    },
    onError: () => toast.error('Failed to update vendor'),
  });

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', ''].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border border-surface-200 rounded-xl space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-surface-200 rounded-2xl overflow-auto max-h-[calc(100vh-300px)]">
          <table className="w-full min-w-[640px]">
            <thead className="bg-surface-50 border-b border-surface-100 sticky top-0 z-10">
              <tr>
                {['Vendor', 'Store', 'Applied', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {data?.vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-surface-900">
                      {vendor.businessName}
                    </p>
                    <p className="text-xs text-surface-500">{vendor.businessEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-surface-900">{vendor.store?.name ?? '—'}</p>
                    {vendor.businessName && (
                      <p className="text-xs text-surface-400">{vendor.businessName}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-500">
                    {formatDate(vendor.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_BADGE[vendor.status] ?? 'default'} size="sm">
                      {vendor.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingVendor(vendor)}
                        className="p-1.5 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-surface-100"
                        aria-label="View details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {vendor.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => moderateMutation.mutate({ vendorId: vendor.id, action: 'APPROVE' })}
                            className="p-1.5 text-surface-400 hover:text-green-600 transition-colors rounded-lg hover:bg-surface-100"
                            aria-label="Approve"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setViewingVendor(vendor); setRejectReason(''); }}
                            className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors rounded-lg hover:bg-surface-100"
                            aria-label="Reject"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
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

      {/* Detail/action modal */}
      <Modal
        isOpen={Boolean(viewingVendor)}
        onClose={() => setViewingVendor(null)}
        title="Vendor Details"
        size="md"
      >
        {viewingVendor && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-surface-500 text-xs font-medium mb-0.5">Name</p>
                <p className="font-semibold text-surface-900">
                  {viewingVendor.businessName}
                </p>
              </div>
              <div>
                <p className="text-surface-500 text-xs font-medium mb-0.5">Email</p>
                <p className="text-surface-900">{viewingVendor.businessEmail}</p>
              </div>
              <div>
                <p className="text-surface-500 text-xs font-medium mb-0.5">Business</p>
                <p className="text-surface-900">{viewingVendor.businessName ?? '—'}</p>
              </div>
              <div>
                <p className="text-surface-500 text-xs font-medium mb-0.5">Type</p>
                <p className="text-surface-900">{viewingVendor.description ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-surface-500 text-xs font-medium mb-0.5">Tax ID</p>
                <p className="text-surface-900 font-mono">N/A</p>
              </div>
              <div>
                <p className="text-surface-500 text-xs font-medium mb-0.5">Applied</p>
                <p className="text-surface-900">{formatDate(viewingVendor.createdAt)}</p>
              </div>
            </div>

            {viewingVendor.description && (
              <div>
                <p className="text-surface-500 text-xs font-medium mb-1">Description</p>
                <p className="text-sm text-surface-700">{viewingVendor.description}</p>
              </div>
            )}

            {viewingVendor.status === 'PENDING' && (
              <div className="space-y-3 pt-3 border-t border-surface-100">
                <div>
                  <label className="text-sm font-medium text-surface-700 block mb-1.5">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    placeholder="Optional reason for rejection..."
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    isLoading={moderateMutation.isPending}
                    onClick={() =>
                      moderateMutation.mutate({ vendorId: viewingVendor.id, action: 'APPROVE' })
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    isLoading={moderateMutation.isPending}
                    onClick={() =>
                      moderateMutation.mutate({
                        vendorId: viewingVendor.id,
                        action: 'REJECT',
                        reason: rejectReason,
                      })
                    }
                  >
                    Reject
                  </Button>
                  <Button variant="ghost" onClick={() => setViewingVendor(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
