import { VendorStatus } from '@prisma/client';

export interface CreateVendorApplicationInput {
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  description?: string;
  taxId?: string;
}

export interface UpdateVendorProfileInput {
  businessName?: string;
  businessPhone?: string;
  description?: string;
  website?: string;
}

export interface CreateStoreInput {
  name: string;
  slug: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
}

export interface UpdateStoreInput extends Partial<CreateStoreInput> {}

export interface AdminApproveVendorInput {
  action: 'approve' | 'reject' | 'suspend';
  reason?: string;
  commissionRate?: number;
}

export interface VendorListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: VendorStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
