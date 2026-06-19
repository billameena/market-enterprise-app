import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthTokens } from '../types/auth.types';
import { storage, AUTH_KEYS } from '../utils/storage';

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  clearAuth: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        storage.set(AUTH_KEYS.ACCESS_TOKEN, tokens.accessToken);
        storage.set(AUTH_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearAuth: () => {
        storage.remove(AUTH_KEYS.ACCESS_TOKEN);
        storage.remove(AUTH_KEYS.REFRESH_TOKEN);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setAccessToken: (token) => {
        storage.set(AUTH_KEYS.ACCESS_TOKEN, token);
        set({ accessToken: token });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Listen for logout events from the API interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().clearAuth();
  });
}
