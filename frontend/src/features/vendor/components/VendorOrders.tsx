import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { api } from '../../../utils/api';
import { OrderStatus } from '../../orders/components/OrderStatus';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Pagination';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../../utils/format';
import { usePagination } from '../../../hooks/usePagination';
import type { Order, OrderStatus as OrderStatusType } from '../../../types/order.types';
import toast from 'react-hot-toast';

interface VendorOrdersData {
  orders: Order[];
  total: number;
  pages: number;
}

const ALLOWED_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  CONFIRMED: ['PROCESSING'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  PENDING: [],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
  PAYMENT_FAILED: [],
  COMPLETED: [],
};

export function VendorOrders() {
  const queryClient = useQueryClient();
  const { page, setPage, pageSize } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInfo, setTrackingInfo] = useState({ trackingNumber: '', carrier: '' });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendor', 'orders', page, statusFilter],
    queryFn: () =>
      api
        .get<VendorOrdersData>('/vendors/me/orders', {
          params: { page, limit: pageSize, ...(statusFilter && { status: statusFilter }) },
        })
        .then((r) => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, ...rest }: { orderId: string; status: string; trackingNumber?: string; carrier?: string }) =>
      api.patch(`/orders/${orderId}/status`, { status, ...rest }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['vendor', 'orders'] });
      setSelectedOrder(null);
    },
    onError: () => toast.error('Failed to update order'),
  });

  const statuses = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border border-surface-200 rounded-xl space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-surface-200 rounded-2xl">
          <p className="text-sm font-medium text-danger-600 mb-1">Failed to load orders</p>
          <p className="text-xs text-surface-500">Check your connection and try refreshing the page.</p>
        </div>
      ) : (
        <div className="border border-surface-200 rounded-2xl overflow-auto max-h-[calc(100vh-300px)]">
          <table className="w-full min-w-[640px]">
            <thead className="bg-surface-50 border-b border-surface-100 sticky top-0 z-10">
              <tr>
                {['Order', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {data?.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-sm font-medium text-surface-600 mb-1">No orders yet</p>
                    <p className="text-xs text-surface-400">Orders will appear here once customers purchase your products.</p>
                  </td>
                </tr>
              )}
              {data?.orders.map((order) => {
                const nextStatuses = ALLOWED_TRANSITIONS[order.status] ?? [];
                return (
                  <tr key={order.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        to="/orders/$orderId"
                        params={{ orderId: order.id }}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-surface-900">{order.items?.[0]?.productName ?? '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-surface-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-surface-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatus status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      {nextStatuses.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingInfo({ trackingNumber: '', carrier: '' });
                          }}
                        >
                          Update
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data?.pages && data.pages > 1 && (
        <Pagination
          meta={{ page, totalPages: data.pages, total: data.total ?? 0, pageSize, hasNextPage: page < data.pages, hasPreviousPage: page > 1 }}
          onPageChange={setPage}
        />
      )}

      {/* Update status modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order #${selectedOrder?.orderNumber}`}
        size="sm"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <p className="text-sm text-surface-600">
              Current status: <strong>{selectedOrder.status}</strong>
            </p>

            {selectedOrder.status === 'PROCESSING' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-surface-700 block mb-1.5">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingInfo.trackingNumber}
                    onChange={(e) => setTrackingInfo((p) => ({ ...p, trackingNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="1Z999AA1234567890"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-surface-700 block mb-1.5">Carrier</label>
                  <select
                    value={trackingInfo.carrier}
                    onChange={(e) => setTrackingInfo((p) => ({ ...p, carrier: e.target.value }))}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Select carrier</option>
                    {['UPS', 'FedEx', 'USPS', 'DHL', 'Amazon'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {(ALLOWED_TRANSITIONS[selectedOrder.status] ?? []).map((nextStatus) => (
                <Button
                  key={nextStatus}
                  isLoading={updateStatusMutation.isPending}
                  onClick={() =>
                    updateStatusMutation.mutate({
                      orderId: selectedOrder.id,
                      status: nextStatus,
                      ...trackingInfo,
                    })
                  }
                >
                  Mark as {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
                </Button>
              ))}
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
