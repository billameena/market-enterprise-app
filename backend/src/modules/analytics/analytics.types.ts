export interface DateRangeQuery {
  from?: string;
  to?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalVendors: number;
  gmv: number;
  pendingVendors: number;
  pendingProducts: number;
  activeProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  revenueTimeSeries: RevenueDataPoint[];
}

export interface VendorStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}
