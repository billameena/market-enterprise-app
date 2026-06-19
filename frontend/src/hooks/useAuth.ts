import { useAuthStore } from '../store/auth.store';
import type { UserRole } from '../types/auth.types';

export function useAuth() {
  const { user, isAuthenticated, accessToken, setAuth, clearAuth, updateUser } = useAuthStore();

  function hasRole(role: UserRole): boolean {
    return user?.role === role;
  }

  function hasAnyRole(...roles: UserRole[]): boolean {
    return roles.some((role) => user?.role === role);
  }

  function isAdmin(): boolean {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  }

  function isVendor(): boolean {
    return user?.role === 'VENDOR';
  }

  return {
    user,
    isAuthenticated,
    accessToken,
    hasRole,
    hasAnyRole,
    isAdmin,
    isVendor,
    setAuth,
    clearAuth,
    updateUser,
  };
}
