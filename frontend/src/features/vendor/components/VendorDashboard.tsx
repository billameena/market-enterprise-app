import { useState } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  StarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { useVendorStats } from '../hooks/useVendorStats';
import { VendorProducts } from './VendorProducts';
import { VendorOrders } from './VendorOrders';
import { VendorAnalytics } from './VendorAnalytics';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatCurrency } from '../../../utils/format';

type Tab = 'overview' | 'products' | 'orders' | 'analytics';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'primary',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color?: 'primary' | 'green' | 'yellow' | 'purple';
}) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="p-5 bg-white border border-surface-200 rounded-2xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-surface-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-surface-900">{value}</p>
      {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
    </div>
  );
}

export function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { data: stats, isLoading } = useVendorStats();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-surface-600 hover:text-surface-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 border border-surface-200 rounded-2xl space-y-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={CurrencyDollarIcon}
                label="Total Revenue"
                value={formatCurrency(stats?.totalRevenue ?? 0)}
                sub={`Avg order: ${formatCurrency(stats?.averageOrderValue ?? 0)}`}
                color="green"
              />
              <StatCard
                icon={ShoppingBagIcon}
                label="Total Orders"
                value={String(stats?.totalOrders ?? 0)}
                sub="all time"
                color="primary"
              />
              <StatCard
                icon={CubeIcon}
                label="Products"
                value={String(stats?.totalProducts ?? 0)}
                sub="active listings"
                color="purple"
              />
              <StatCard
                icon={StarIcon}
                label="Avg Order Value"
                value={formatCurrency(stats?.averageOrderValue ?? 0)}
                sub="per order"
                color="yellow"
              />
            </div>
          )}

          <div className="p-6 bg-white border border-surface-200 rounded-2xl">
            <h3 className="font-semibold text-surface-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('products')}
                className="p-3 text-left rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <p className="text-sm font-medium text-surface-900">Manage Products</p>
                <p className="text-xs text-surface-500 mt-0.5">Add, edit, or remove products</p>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="p-3 text-left rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <p className="text-sm font-medium text-surface-900">Process Orders</p>
                <p className="text-xs text-surface-500 mt-0.5">Update shipping & status</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && <VendorProducts />}
      {activeTab === 'orders' && <VendorOrders />}
      {activeTab === 'analytics' && <VendorAnalytics />}
    </div>
  );
}
