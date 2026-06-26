import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { storage, AUTH_KEYS } from './storage';
import type { ApiResponse, ApiError } from '../types/api.types';
import type { AuthTokens } from '../types/auth.types';

const BASE_URL = import.meta.env['VITE_API_URL'] as string ?? 'http://localhost:3000/api/v1';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  withCredentials: true,
});

function getGuestSessionId(): string {
  const key = 'x-session-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// Request interceptor — attach access token + guest session id
apiClient.interceptors.request.use((config) => {
  const token = storage.get<string>(AUTH_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (config.headers) {
    config.headers['x-session-id'] = getGuestSessionId();
  }
  return config;
});

// Response interceptor — handle 401 + token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<null>>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = storage.get<string>(AUTH_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        clearAuth();
        return Promise.reject(buildApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<ApiResponse<AuthTokens>>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        const tokens = data.data;
        storage.set(AUTH_KEYS.ACCESS_TOKEN, tokens.accessToken);
        storage.set(AUTH_KEYS.REFRESH_TOKEN, tokens.refreshToken);

        isRefreshing = false;
        onTokenRefreshed(tokens.accessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        clearAuth();
        return Promise.reject(buildApiError(refreshError as AxiosError<ApiResponse<null>>));
      }
    }

    return Promise.reject(buildApiError(error));
  },
);

function clearAuth(): void {
  storage.remove(AUTH_KEYS.ACCESS_TOKEN);
  storage.remove(AUTH_KEYS.REFRESH_TOKEN);
  storage.remove(AUTH_KEYS.USER);
  window.dispatchEvent(new Event('auth:logout'));
}

function buildApiError(error: AxiosError<ApiResponse<null>>): ApiError {
  return {
    message: error.response?.data?.message ?? error.message ?? 'An error occurred',
    status: error.response?.status ?? 0,
    errors: error.response?.data?.errors,
  };
}

// Typed API helpers
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<T>>(url, config).then((r) => r.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<ApiResponse<T>>(url, data, config).then((r) => r.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<ApiResponse<T>>(url, data, config).then((r) => r.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiResponse<T>>(url, data, config).then((r) => r.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiResponse<T>>(url, config).then((r) => r.data),
};
