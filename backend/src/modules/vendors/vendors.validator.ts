import { z } from 'zod';
import { VendorStatus } from '@prisma/client';

export const createVendorSchema = z.object({
  businessName: z.string().min(2).max(100).trim(),
  businessEmail: z.string().email().toLowerCase(),
  businessPhone: z.string().optional(),
  description: z.string().max(1000).optional(),
  taxId: z.string().max(50).optional(),
});

export const updateVendorSchema = z.object({
  businessName: z.string().min(2).max(100).trim().optional(),
  businessPhone: z.string().optional(),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional(),
});

export const createStoreSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(2000).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().max(500).optional(),
  returnPolicy: z.string().max(2000).optional(),
  shippingPolicy: z.string().max(2000).optional(),
});

export const updateStoreSchema = createStoreSchema.partial();

export const adminVendorActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend']),
  reason: z.string().max(500).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

export const vendorListQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  search: z.string().max(100).optional(),
  status: z.nativeEnum(VendorStatus).optional(),
  sortBy: z.enum(['createdAt', 'businessName', 'totalRevenue']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
