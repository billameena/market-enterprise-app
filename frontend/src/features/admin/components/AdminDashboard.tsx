import { useState } from 'react';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAdminStats } from '../hooks/useAdminStats';
import { UserManagement } from './UserManagement';
import { VendorApproval } from './VendorApproval';
import { ProductModeration } from './ProductModeration';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatCurrency } from '../../../utils/format';

type Tab = 'overview' | 'users' | 'vendors' | 'products';

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-50',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: number;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="p-5 bg-white border border-surface-200 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-sm text-surface-500">{label}</p>
      <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { data: stats, isLoading } = useAdminStats();

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'vendors', label: 'Vendors', badge: stats?.pendingVendors },
    { key: 'products', label: 'Products', badge: stats?.pendingProducts },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-surface-600 hover:text-surface-900'
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-5 border border-surface-200 rounded-2xl space-y-2">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                icon={CurrencyDollarIcon}
                label="GMV"
                value={formatCurrency(stats?.gmv ?? 0)}
                change={stats?.revenueGrowth}
                iconBg="bg-green-50"
                iconColor="text-green-600"
              />
              <StatCard
                icon={CurrencyDollarIcon}
                label="Revenue"
                value={formatCurrency(stats?.totalRevenue ?? 0)}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                icon={ShoppingBagIcon}
                label="Orders"
                value={String(stats?.totalOrders ?? 0)}
                change={stats?.orderGrowth}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatCard
                icon={UsersIcon}
                label="Users"
                value={String(stats?.totalUsers ?? 0)}
                change={stats?.userGrowth}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />
              <StatCard
                icon={BuildingStorefrontIcon}
                label="Vendors"
                value={String(stats?.totalVendors ?? 0)}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
              />
              <StatCard
                icon={CubeIcon}
                label="Products"
                value={String(stats?.activeProducts ?? 0)}
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
              />
            </div>
          )}

          {/* Pending alerts */}
          {((stats?.pendingVendors ?? 0) > 0 || (stats?.pendingProducts ?? 0) > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(stats?.pendingVendors ?? 0) > 0 && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <ClockIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      {stats?.pendingVendors} vendor{stats?.pendingVendors !== 1 ? 's' : ''} awaiting approval
                    </p>
                    <button onClick={() => setActiveTab('vendors')} className="text-xs text-yellow-700 underline mt-0.5">
                      Review now
                    </button>
                  </div>
                </div>
              )}
              {(stats?.pendingProducts ?? 0) > 0 && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <CubeIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      {stats?.pendingProducts} product{stats?.pendingProducts !== 1 ? 's' : ''} pending review
                    </p>
                    <button onClick={() => setActiveTab('products')} className="text-xs text-blue-700 underline mt-0.5">
                      Review now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revenue chart */}
          <div className="p-6 bg-white border border-surface-200 rounded-2xl">
            <h3 className="font-bold text-surface-900 mb-6">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.revenueTimeSeries ?? []}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  fill="url(#adminRevGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'vendors' && <VendorApproval />}
      {activeTab === 'products' && <ProductModeration />}
    </div>
  );
}
