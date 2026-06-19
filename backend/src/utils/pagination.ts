import { PaginationMeta, PaginationQuery, PaginatedResult } from '../types/common.types';
import { env } from '../configs/env';

export interface PrismaFindManyArgs {
  skip: number;
  take: number;
  orderBy?: Record<string, string>;
}

export function parsePaginationQuery(query: PaginationQuery): {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(
    env.MAX_PAGE_SIZE,
    Math.max(1, Number(query.pageSize) || env.DEFAULT_PAGE_SIZE),
  );
  const skip = (page - 1) * pageSize;
  return { skip, take: pageSize, page, pageSize };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items,
    meta: buildPaginationMeta(total, page, pageSize),
  };
}
