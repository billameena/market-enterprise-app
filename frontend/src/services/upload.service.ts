import { apiClient } from '../utils/api';
import type { ApiResponse } from '../types/api.types';

export const uploadService = {
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      '/users/me/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data.data.avatarUrl;
  },

  async uploadProductImages(productId: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    await apiClient.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
