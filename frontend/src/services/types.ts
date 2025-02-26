/**
 * Common API response types
 */
export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  errors?: Record<string, string[]>;
}
