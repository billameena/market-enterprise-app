import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from './error.middleware';

const roleHierarchy: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  SUPPORT: 60,
  VENDOR: 40,
  CUSTOMER: 20,
};

/**
 * Require user to have at least the specified role level.
 * Use requireRole('ADMIN') to allow ADMIN and SUPER_ADMIN.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    const userLevel = roleHierarchy[req.user.role];
    const hasAccess = allowedRoles.some((role) => {
      const requiredLevel = roleHierarchy[role];
      return userLevel >= requiredLevel;
    });

    if (!hasAccess) {
      return next(
        AppError.forbidden(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        ),
      );
    }

    next();
  };
}

/**
 * Require exact role match (no hierarchy).
 */
export function requireExactRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`Access denied. Required roles: ${roles.join(', ')}`));
    }

    next();
  };
}

/**
 * Ensure the authenticated user owns the resource.
 * Admins bypass this check.
 */
export function requireOwnership(getUserId: (req: Request) => string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    const isAdmin = roleHierarchy[req.user.role] >= roleHierarchy.ADMIN;
    if (isAdmin) return next();

    const resourceOwnerId = getUserId(req);
    if (req.user.id !== resourceOwnerId) {
      return next(AppError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
}
