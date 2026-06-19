import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types/common.types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: PaginationMeta,
): Response<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message = 'Resource created successfully',
): Response<ApiResponse<T>> {
  return sendSuccess(res, data, message, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown,
): Response<ApiResponse<null>> {
  const response: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
}
