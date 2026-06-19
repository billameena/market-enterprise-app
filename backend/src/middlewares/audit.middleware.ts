import { Request, Response, NextFunction } from 'express';
import { prisma } from '../configs/database';
import { logger } from '../configs/logger';

const AUDITED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

interface AuditableRequest extends Request {
  auditAction?: string;
  auditResource?: string;
  auditResourceId?: string;
}

export function auditLog(action: string, resource: string) {
  return (req: AuditableRequest, _res: Response, next: NextFunction): void => {
    req.auditAction = action;
    req.auditResource = resource;
    next();
  };
}

export function autoAuditMiddleware(
  req: AuditableRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!AUDITED_METHODS.includes(req.method)) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = (body: unknown) => {
    // Only log on successful mutations
    if (
      typeof body === 'object' &&
      body !== null &&
      'success' in body &&
      (body as Record<string, unknown>)['success'] === true
    ) {
      const userId = req.user?.id;
      const action = req.auditAction ?? `${req.method}:${req.path}`;
      const resource = req.auditResource ?? 'Unknown';
      const resourceId = req.auditResourceId ?? (req.params['id'] as string | undefined);

      prisma.auditLog
        .create({
          data: {
            userId: userId ?? null,
            action,
            resource,
            resourceId: resourceId ?? null,
            newValue: req.body as Record<string, unknown>,
            ipAddress: req.ip ?? null,
            userAgent: req.headers['user-agent'] ?? null,
          },
        })
        .catch((err: Error) => {
          logger.error('Failed to write audit log', { error: err.message });
        });
    }

    return originalJson(body);
  };

  next();
}
