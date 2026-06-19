import { api } from '../utils/api';
import type { CartSummary } from '../types/cart.types';

export const cartService = {
  async getCart(): Promise<CartSummary> {
    const response = await api.get<CartSummary>('/cart');
    return response.data;
  },

  async addItem(productId: string, quantity: number, variantId?: string): Promise<CartSummary> {
    const response = await api.post<CartSummary>('/cart/items', { productId, quantity, variantId });
    return response.data;
  },

  async updateItem(itemId: string, quantity: number): Promise<CartSummary> {
    const response = await api.patch<CartSummary>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  async removeItem(itemId: string): Promise<CartSummary> {
    const response = await api.delete<CartSummary>(`/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },

  async applyCoupon(couponCode: string): Promise<CartSummary> {
    const response = await api.post<CartSummary>('/cart/coupon', { couponCode });
    return response.data;
  },

  async removeCoupon(): Promise<CartSummary> {
    const response = await api.delete<CartSummary>('/cart/coupon');
    return response.data;
  },
};
