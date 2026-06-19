import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

const variantSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  weight: z.number().positive().optional(),
  attributes: z.record(z.string()),
});

export const createProductSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(2).max(255).trim(),
  description: z.string().max(10000).optional(),
  shortDescription: z.string().max(500).optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  isDigital: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  variants: z.array(variantSchema).optional(),
  tagIds: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.omit({ variants: true }).partial();

export const productListQuerySchema = z.object({
  page: z.string().optional().transform((v) => v !== undefined ? Number(v) : undefined),
  pageSize: z.string().optional().transform((v) => v !== undefined ? Number(v) : undefined),
  search: z.string().max(100).optional(),
  categoryId: z.string().optional(),
  vendorId: z.string().optional(),
  storeId: z.string().optional(),
  minPrice: z.string().optional().transform((v) => v !== undefined ? Number(v) : undefined),
  maxPrice: z.string().optional().transform((v) => v !== undefined ? Number(v) : undefined),
  status: z.nativeEnum(ProductStatus).optional(),
  isFeatured: z.string().optional().transform((v) => v !== undefined ? v === 'true' : undefined),
  tagIds: z.string().optional(),
  sortBy: z.enum(['price', 'createdAt', 'totalSold', 'averageRating', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const adminProductActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  allowBackorder: z.boolean().optional(),
});
