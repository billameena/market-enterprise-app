import { api } from '../utils/api';
import type { Product, ProductFilters } from '../types/product.types';
import type { PaginatedData } from '../types/api.types';

export const productService = {
  async getProducts(filters: ProductFilters): Promise<PaginatedData<Product>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    });

    const response = await api.get<Product[]>(`/products?${params.toString()}`);
    return {
      items: response.data,
      meta: response.meta!,
    };
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await api.get<Product>(`/products/slug/${slug}`);
    return response.data;
  },

  async getRelatedProducts(productId: string): Promise<Product[]> {
    const response = await api.get<Product[]>(`/products/${productId}/related`);
    return response.data;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products?isFeatured=true&pageSize=8');
    return response.data;
  },

  async searchProducts(query: string, page = 1): Promise<PaginatedData<Product>> {
    const response = await api.get<Product[]>(`/products?search=${encodeURIComponent(query)}&page=${page}`);
    return { items: response.data, meta: response.meta! };
  },
};
