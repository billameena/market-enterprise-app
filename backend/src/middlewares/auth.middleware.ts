import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './error.middleware';
import { prisma } from '../configs/database';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authorization header missing or malformed');
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    // Verify session still exists in DB (handles logout)
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw AppError.unauthorized('Session expired or invalidated');
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as import('@prisma/client').UserRole,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as import('@prisma/client').UserRole,
      sessionId: payload.sessionId,
    };
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}
