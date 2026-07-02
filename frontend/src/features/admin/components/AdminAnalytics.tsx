import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '../../../utils/api';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatCurrency } from '../../../utils/format';
import { useAdminStats } from '../hooks/useAdminStats';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

function StatCard({ label, value, growth, prefix = '' }: { label: string; value: string; growth?: number; prefix?: string }) {
  return (
    <div className="p-5 bg-white border border-surface-200 rounded-2xl">
      <p className="text-sm text-surface-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-surface-900">{prefix}{value}</p>
      {growth !== undefined && (
        <p className={`text-xs font-semibold mt-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs last 30 days
        </p>
      )}
    </div>
  );
}

export function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  const { data: revenueData, isLoading: chartLoading } = useQuery({
    queryKey: ['admin', 'revenue', days],
    queryFn: () =>
      api.get<RevenueDataPoint[]>(`/analytics/admin/revenue?days=${days}`).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = statsLoading || chartLoading;

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-surface-900">Platform Analytics</h2>
        <div className="flex gap-1 bg-surface-100 p-1 rounded-xl">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                days === d ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 border border-surface-200 rounded-2xl space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Revenue (30d)" value={formatCurrency(stats?.totalRevenue ?? 0)} growth={stats?.revenueGrowth} />
          <StatCard label="Orders (30d)" value={String(stats?.totalOrders ?? 0)} growth={stats?.orderGrowth} />
          <StatCard label="Total Users" value={String(stats?.totalUsers ?? 0)} growth={stats?.userGrowth} />
          <StatCard label="GMV (All Time)" value={formatCurrency(stats?.gmv ?? 0)} />
        </div>
      )}

      {/* Revenue + Orders chart */}
      <div className="p-6 bg-white border border-surface-200 rounded-2xl">
        <h3 className="font-bold text-surface-900 mb-6">Revenue & Orders — Last {days} Days</h3>
        {chartLoading ? (
          <Skeleton className="w-full h-72 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData ?? []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenue' : 'Orders',
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
              <Legend />
              <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} name="revenue" />
              <Bar yAxisId="orders" dataKey="orders" fill="#e0e7ff" radius={[2, 2, 0, 0]} name="orders" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Vendor & Product summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-surface-200 rounded-2xl">
          <p className="text-sm text-surface-500 mb-1">Active Vendors</p>
          <p className="text-2xl font-bold text-surface-900">{stats?.totalVendors ?? 0}</p>
          {(stats?.pendingVendors ?? 0) > 0 && (
            <p className="text-xs text-amber-600 font-semibold mt-1">{stats?.pendingVendors} pending approval</p>
          )}
        </div>
        <div className="p-5 bg-white border border-surface-200 rounded-2xl">
          <p className="text-sm text-surface-500 mb-1">Active Products</p>
          <p className="text-2xl font-bold text-surface-900">{stats?.activeProducts ?? 0}</p>
          {(stats?.pendingProducts ?? 0) > 0 && (
            <p className="text-xs text-blue-600 font-semibold mt-1">{stats?.pendingProducts} pending review</p>
          )}
        </div>
        <div className="p-5 bg-white border border-surface-200 rounded-2xl">
          <p className="text-sm text-surface-500 mb-1">Platform GMV</p>
          <p className="text-2xl font-bold text-surface-900">{formatCurrency(stats?.gmv ?? 0)}</p>
          <p className="text-xs text-surface-400 mt-1">All time paid orders</p>
        </div>
      </div>
    </div>
  );
}
