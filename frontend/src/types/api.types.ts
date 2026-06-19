export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  errors?: ValidationError[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: ValidationError[];
}
