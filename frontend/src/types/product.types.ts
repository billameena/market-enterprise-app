export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  price: number;
  comparePrice: number | null;
  status: ProductStatus;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  totalSold: number;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  inventory: ProductInventory | null;
  store: { id: string; name: string; slug: string };
  vendor: { id: string; businessName: string; rating: number };
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isActive: boolean;
  attributeValues: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  value: string;
  attribute: { name: string };
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductInventory {
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  children?: Category[];
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'createdAt' | 'totalSold' | 'averageRating' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
