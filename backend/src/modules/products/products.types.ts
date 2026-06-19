import { ProductStatus } from '@prisma/client';

export interface CreateProductInput {
  categoryId: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  weight?: number;
  inventory?: number;
  isDigital?: boolean;
  requiresShipping?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  variants?: CreateVariantInput[];
  tagIds?: string[];
}

export interface CreateVariantInput {
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  weight?: number;
  attributes: Record<string, string>;
}

export interface UpdateProductInput extends Partial<Omit<CreateProductInput, 'variants'>> {}

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  vendorId?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  tagIds?: string[];
  sortBy?: 'price' | 'createdAt' | 'totalSold' | 'averageRating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminProductActionInput {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface UpdateInventoryInput {
  quantity: number;
  lowStockThreshold?: number;
  allowBackorder?: boolean;
}
