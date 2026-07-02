import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, PauseIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../../utils/api';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { formatCurrency, formatDate } from '../../../utils/format';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  maxUses: number | null;
  usageCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const couponSchema = z.object({
  code: z.string().min(3, 'Min 3 characters').max(50).toUpperCase(),
  name: z.string().min(1, 'Required').max(100),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.coerce.number().positive('Must be positive'),
  minOrderAmount: z.coerce.number().positive().optional(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  maxUsesPerUser: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
});

type CouponForm = z.infer<typeof couponSchema>;

export function AdminCoupons() {
  const queryClient = useQueryClient();
  const { page, setPage, pageSize } = usePagination();
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
    defaultValues: { type: 'PERCENTAGE' },
  });

  const couponType = watch('type');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', page],
    queryFn: () =>
      api
        .get<Coupon[]>('/coupons', { params: { page, limit: pageSize } })
        .then((r) => ({ coupons: r.data, total: r.meta?.total ?? 0, pages: r.meta?.totalPages ?? 0 })),
  });

  const createMutation = useMutation({
    mutationFn: (values: CouponForm) => api.post('/coupons', values),
    onSuccess: () => {
      toast.success('Coupon created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setShowCreate(false);
      reset();
    },
    onError: (e: { message: string }) => toast.error(e.message ?? 'Failed to create coupon'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/coupons/${id}/deactivate`, {}),
    onSuccess: () => {
      toast.success('Coupon deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: () => toast.error('Failed to deactivate coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-500">{data?.total ?? 0} coupons total</p>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <PlusIcon className="w-4 h-4 mr-1" /> Create Coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border border-surface-200 rounded-xl space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-surface-200 rounded-2xl overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-surface-50 border-b border-surface-100">
              <tr>
                {['Code', 'Type', 'Value', 'Usage', 'Status', 'Expires', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {data?.coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-surface-400 text-sm">
                    No coupons yet — create one above
                  </td>
                </tr>
              )}
              {data?.coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-bold text-surface-900 bg-surface-100 px-2 py-0.5 rounded">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={coupon.type === 'PERCENTAGE' ? 'primary' : 'default'} size="sm">
                      {coupon.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-surface-900">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-700">
                    {coupon.usageCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={coupon.isActive ? 'success' : 'danger'} size="sm">
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-500">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {coupon.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={deactivateMutation.isPending}
                          onClick={() => deactivateMutation.mutate(coupon.id)}
                          title="Deactivate"
                        >
                          <PauseIcon className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Delete coupon ${coupon.code}?`)) deleteMutation.mutate(coupon.id);
                        }}
                        title="Delete"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(data?.pages ?? 0) > 1 && (
        <Pagination
          meta={{ page, totalPages: data!.pages, hasNextPage: page < data!.pages, hasPreviousPage: page > 1, total: data!.total, pageSize }}
          onPageChange={setPage}
        />
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="Create Coupon">
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Code" {...register('code')} error={errors.code?.message} placeholder="SAVE20" />
            <Input label="Coupon Name" {...register('name')} error={errors.name?.message} placeholder="Summer Sale" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed ($)</option>
              </select>
            </div>
            <Input
              label={couponType === 'PERCENTAGE' ? 'Discount %' : 'Discount $'}
              type="number"
              step="0.01"
              {...register('value')}
              error={errors.value?.message}
              placeholder={couponType === 'PERCENTAGE' ? '20' : '10'}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Order Amount" type="number" step="0.01" {...register('minOrderAmount')} placeholder="50" />
            {couponType === 'PERCENTAGE' && (
              <Input label="Max Discount $" type="number" step="0.01" {...register('maxDiscountAmount')} placeholder="100" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Total Usage Limit" type="number" {...register('maxUses')} placeholder="100" />
            <Input label="Per-user Limit" type="number" {...register('maxUsesPerUser')} placeholder="1" />
          </div>
          <Input label="Expires At (optional)" type="datetime-local" {...register('expiresAt')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
