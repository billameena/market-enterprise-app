import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth.types';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
  redirectTo?: string;
}

export function RoleGuard({ children, roles, redirectTo = '/' }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: undefined }} replace />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
