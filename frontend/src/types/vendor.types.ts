export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Vendor {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  website: string | null;
  status: VendorStatus;
  commissionRate: number;
  isVerified: boolean;
  totalRevenue: number;
  totalOrders: number;
  rating: number;
  store: Store | null;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  contactEmail: string | null;
  isActive: boolean;
}

export interface VendorStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}
