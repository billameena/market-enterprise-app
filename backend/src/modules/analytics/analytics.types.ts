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
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
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
