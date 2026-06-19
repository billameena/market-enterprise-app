import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        const errors = (result.error as ZodError).errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        return next(AppError.badRequest('Validation failed', errors));
      }
      req[part] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}

export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}
