import { useState } from 'react';
import { OrderList } from '../features/orders/components/OrderList';

const STATUS_TABS = [
  { label: 'All Orders', value: '' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function Orders() {
  const [statusFilter, setStatusFilter] = useState('');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">My Orders</h1>

      <div className="flex gap-1 border-b border-surface-200 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              statusFilter === tab.value
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-surface-600 hover:text-surface-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <OrderList statusFilter={statusFilter || undefined} />
    </div>
  );
}
