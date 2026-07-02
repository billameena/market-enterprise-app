import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { api } from '../../../utils/api';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Pagination';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePagination } from '../../../hooks/usePagination';
import { formatDate } from '../../../utils/format';
import type { UserRole } from '../../../types/auth.types';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  _count: { orders: number };
}

const ROLE_BADGE: Record<UserRole, 'success' | 'warning' | 'danger' | 'default' | 'primary'> = {
  SUPER_ADMIN: 'danger',
  ADMIN: 'warning',
  VENDOR: 'primary',
  CUSTOMER: 'default',
  SUPPORT: 'default',
};

export function UserManagement() {
  const queryClient = useQueryClient();
  const { page, setPage, pageSize } = usePagination();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users', page, debouncedSearch, roleFilter],
    queryFn: () =>
      api
        .get<AdminUser[]>('/users', {
          params: { page, limit: pageSize, search: debouncedSearch || undefined, role: roleFilter || undefined },
        })
        .then((r) => ({
          users: r.data,
          total: r.meta?.total ?? 0,
          pages: r.meta?.totalPages ?? 0,
        })),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch(`/users/${userId}`, { isActive }).then((r) => r.data),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to update user'),
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All Roles</option>
          {['CUSTOMER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 border border-surface-200 rounded-xl">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 text-center border border-red-200 bg-red-50 rounded-2xl text-sm text-red-700">
          Failed to load users — {(error as { message: string })?.message ?? 'please try again'}
        </div>
      ) : (
        <div className="border border-surface-200 rounded-2xl overflow-auto max-h-[calc(100vh-300px)]">
          <table className="w-full min-w-[640px]">
            <thead className="bg-surface-50 border-b border-surface-100 sticky top-0 z-10">
              <tr>
                {['User', 'Role', 'Orders', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-surface-400 text-sm">
                    No users found
                  </td>
                </tr>
              )}
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.avatar ?? undefined}
                        name={`${user.firstName} ${user.lastName}`}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-semibold text-surface-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-surface-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={ROLE_BADGE[user.role] ?? 'default'} size="sm">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-700">{user._count?.orders ?? 0}</td>
                  <td className="px-5 py-4">
                    <Badge variant={user.isActive ? 'success' : 'danger'} size="sm">
                      {user.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-500">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Button
                      size="sm"
                      variant={user.isActive ? 'danger' : 'outline'}
                      isLoading={toggleActiveMutation.isPending}
                      onClick={() =>
                        toggleActiveMutation.mutate({ userId: user.id, isActive: !user.isActive })
                      }
                    >
                      {user.isActive ? 'Suspend' : 'Activate'}
                    </Button>
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
    </div>
  );
}
