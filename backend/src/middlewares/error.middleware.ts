import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../configs/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown;

  constructor(message: string, statusCode = 500, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: unknown): AppError {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(`${resource} not found`, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  static unprocessable(message: string, errors?: unknown): AppError {
    return new AppError(message, 422, errors);
  }

  static tooManyRequests(message = 'Too many requests'): AppError {
    return new AppError(message, 429);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500);
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  const requestId = req.headers['x-request-id'];

  // Operational (known) error
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      requestId,
    });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn('Validation error', { errors: formatted, path: req.path });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      data: null,
      errors: formatted,
    });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.['target'] as string[])?.join(', ') ?? 'field';
      return res.status(409).json({
        success: false,
        message: `A record with this ${fields} already exists`,
        data: null,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        data: null,
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      data: null,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      data: null,
    });
  }

  // Unknown / unhandled error — log full details
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId,
  });

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    data: null,
  });
}
