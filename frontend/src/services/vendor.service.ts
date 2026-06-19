import { api } from '../utils/api';
import type { Vendor, Store, VendorStats } from '../types/vendor.types';

export const vendorService = {
  async applyForVendor(data: {
    businessName: string;
    businessEmail: string;
    businessPhone?: string;
    description?: string;
  }): Promise<Vendor> {
    const response = await api.post<Vendor>('/vendors/apply', data);
    return response.data;
  },

  async getMyProfile(): Promise<Vendor> {
    const response = await api.get<Vendor>('/vendors/me');
    return response.data;
  },

  async updateProfile(data: Partial<Vendor>): Promise<Vendor> {
    const response = await api.patch<Vendor>('/vendors/me', data);
    return response.data;
  },

  async createStore(data: { name: string; slug: string; description?: string }): Promise<Store> {
    const response = await api.post<Store>('/vendors/me/store', data);
    return response.data;
  },

  async updateStore(data: Partial<Store>): Promise<Store> {
    const response = await api.patch<Store>('/vendors/me/store', data);
    return response.data;
  },

  async getStats(): Promise<VendorStats> {
    const response = await api.get<VendorStats>('/analytics/vendor/dashboard');
    return response.data;
  },

  async getPublicProfile(vendorId: string): Promise<Vendor> {
    const response = await api.get<Vendor>(`/vendors/${vendorId}/profile`);
    return response.data;
  },
};
