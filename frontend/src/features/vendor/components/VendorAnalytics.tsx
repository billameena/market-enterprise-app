import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { api } from '../../../utils/api';
import { Spinner } from '../../../components/ui/Spinner';
import { formatCurrency } from '../../../utils/format';

interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  units: number;
}

interface VendorAnalyticsData {
  revenue: RevenuePoint[];
  topProducts: TopProduct[];
  period: string;
}

export function VendorAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'analytics'],
    queryFn: () =>
      api
        .get<VendorAnalyticsData>('/vendors/me/analytics?period=30d')
        .then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Revenue chart */}
      <div className="p-6 bg-white border border-surface-200 rounded-2xl">
        <h3 className="font-bold text-surface-900 mb-6">Revenue (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data?.revenue ?? []}>
            <defs>
              <linearGradient id="vendorRevGrad" x1="0" y1="0" x2="0" y2="1">
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
              fill="url(#vendorRevGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top products */}
      <div className="p-6 bg-white border border-surface-200 rounded-2xl">
        <h3 className="font-bold text-surface-900 mb-6">Top Products by Revenue</h3>
        {data?.topProducts && data.topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${v}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenue' : 'Units',
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} name="Revenue" />
              <Bar dataKey="units" fill="#a5b4fc" radius={[0, 4, 4, 0]} name="Units" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-surface-400 py-8 text-sm">No product data available.</p>
        )}
      </div>
    </div>
  );
}
