import { api } from '../utils/api';
import type { Order } from '../types/order.types';
import type { PaginatedData } from '../types/api.types';

export const orderService = {
  async createOrder(data: { addressId: string; couponCode?: string; notes?: string }): Promise<Order> {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  async getOrders(page = 1, status?: string): Promise<PaginatedData<Order>> {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.append('status', status);
    const response = await api.get<Order[]>(`/orders/me?${params.toString()}`);
    return { items: response.data, meta: response.meta! };
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  async createPaymentIntent(orderId: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const response = await api.post<{ clientSecret: string; paymentIntentId: string }>('/payments/intent', { orderId });
    return response.data;
  },
};
