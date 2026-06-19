export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export type SortOrder = 'asc' | 'desc';

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface FileUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}
