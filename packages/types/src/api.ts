/**
 * @module @repo/types/api
 * @description Standardized API response envelope types.
 * All API endpoints should return responses conforming to these types.
 */

/** Standard successful API response. */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/** Standard error API response. */
export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}

/** Union type for all API responses. */
export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;

/** Paginated API response. */
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/** Pagination query parameters. */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
