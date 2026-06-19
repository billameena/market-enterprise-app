import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional().nullable(),
});

export const createAddressSchema = z.object({
  label: z.string().max(50).optional(),
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  addressLine1: z.string().min(1).max(200).trim(),
  addressLine2: z.string().max(200).trim().optional(),
  city: z.string().min(1).max(100).trim(),
  state: z.string().min(1).max(100).trim(),
  postalCode: z.string().min(1).max(20).trim(),
  country: z.string().min(2).max(3).toUpperCase(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export const adminUpdateUserSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const userListQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  search: z.string().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.string().optional().transform((v) => v === 'true'),
  sortBy: z.enum(['createdAt', 'email', 'firstName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
